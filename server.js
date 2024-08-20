const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 8080;

// Créer un serveur HTTP pour express
const server = app.listen(port, () => {
  console.log(`Relay running at http://localhost:${port}`);
});

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Stocker les événements
const events = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Exemple simple : Gestion des différents types de messages
      if (parsedMessage.kind === 1) {
        // Stocker l'événement reçu
        events.push(parsedMessage);
        // Diffuser l'événement à tous les clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        });
      } else if (parsedMessage.kind === 'REQ') {
        // Retourner les événements demandés
        const subscriptionId = parsedMessage.id;
        const foundEvents = events; // Vous pouvez filtrer selon vos besoins
        foundEvents.forEach(event => {
          ws.send(JSON.stringify({ subscriptionId, ...event }));
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Nostr Relay is running');
});
