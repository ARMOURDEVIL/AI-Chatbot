// server based on parsing
const express = require('express');
const handleUserInput = require('./logic-service.js');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

// for front-files delivery
const app = express();

app.use(express.static('../front2'));

// // SSL/TLS certificate and key
// const sslKey = fs.readFileSync('ssl-key.pem');
// const sslCert = fs.readFileSync('ssl-cert.pem');

// const server = https.createServer({ key: sslKey, cert: sslCert }, app);

const server = http.createServer(app);

// Create a WebSocket server for chat processing
const wss = new WebSocket.Server({ server });

// Load the keyword-response pairs from a JSON file
const getResponses = () => {
    const data = fs.readFileSync('responses.json');
    return JSON.parse(data);
};


wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async message => {

        const { messageHistory } = JSON.parse(message);
        console.log(messageHistory);

        try {
            const result = await handleUserInput(messageHistory);
            console.log('AI Response:', result);

            ws.send(JSON.stringify({ response: result }));
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ error: 'Failed to process the message' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('HTTPS server running on port 3000');
});
