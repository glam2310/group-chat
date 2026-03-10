// 1. Import necessary modules
const http = require('http');           // Node.js built-in HTTP module
const fs = require('fs');               // File system module to read HTML/JS files
const path = require('path');           // Path module to handle file paths
const WebSocket = require('ws');        // The WebSocket library

// 2. Define the port
// We use process.env.PORT for Cloud environments (like Render/Heroku)
// and default to 8080 for local development.
const PORT = process.env.PORT || 8080;

// 3. Create the HTTP server to serve the frontend files
const server = http.createServer(function (request, response) {
    
    // Determine which file to serve
    let filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(404);
            response.end("File not found");
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

// 4. Create the WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server: server });

// 5. Manage WebSocket connections
wss.on('connection', function (socket) {
    console.log("New client connected to the chat.");

    socket.on('message', function (message) {
        // Log the message received from a client
        console.log("Received: " + message);

        // Broadcast the message to all other connected clients
        wss.clients.forEach(function (client) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', function () {
        console.log("Client disconnected.");
    });
});

// 6. Start the server
server.listen(PORT, function () {
    console.log("Server is running and listening on port: " + PORT);
});