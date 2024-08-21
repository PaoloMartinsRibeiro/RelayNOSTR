// const express = require('express');
// const WebSocket = require('ws');

// const app = express();
// const port = process.env.PORT || 8080;

// // Créer un serveur HTTP pour Express
// const server = app.listen(port, () => {
//   console.log(`Relay running at http://localhost:${port}`);
// });

// // Créer un serveur WebSocket
// const wss = new WebSocket.Server({ server });

// // Stocker les pixels avec leur couleur et horodatage
// const pixels = {};

// // Stocker tous les événements
// const events = [];

// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   // Envoyer l'état actuel des pixels au nouveau client
//   Object.values(pixels).forEach((pixelEvent) => {
//     ws.send(JSON.stringify(pixelEvent));
//   });

//   ws.on('message', (message) => {
//     try {
//       const parsedMessage = JSON.parse(message);
      
//       if (parsedMessage.kind === 1) {
//         // Extraire les données du pixel de l'événement
//         const { x, y, color } = JSON.parse(parsedMessage.content);
//         const eventTimestamp = parsedMessage.created_at;
//         const pixelKey = `${x}-${y}`;

//         // Mettre à jour le pixel seulement si l'événement est plus récent
//         if (!pixels[pixelKey] || eventTimestamp > pixels[pixelKey].created_at) {
//           // Mettre à jour ou ajouter l'événement pixel
//           pixels[pixelKey] = parsedMessage;
          
//           // Stocker l'événement dans le tableau des événements
//           events.push(parsedMessage);

//           // Diffuser l'événement à tous les clients
//           wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify(parsedMessage));
//             }
//           });
//         }
//       } else if (parsedMessage.kind === 'REQ') {
//         // Retourner les événements demandés
//         const subscriptionId = parsedMessage.id;
//         events.forEach(event => {
//           ws.send(JSON.stringify({ subscriptionId, ...event }));
//         });
//       }
//     } catch (error) {
//       console.error('Error processing message:', error);
//     }
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// app.get('/', (req, res) => {
//   res.send('Nostr Relay is running');
// });


const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 8080;

// Créer un serveur HTTP pour Express
const server = app.listen(port, () => {
  console.log(`Relay running at http://localhost:${port}`);
});

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Stocker les pixels avec leur couleur et horodatage
const pixels = {};

// Stocker tous les événements
const events = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Envoyer l'état actuel des pixels au nouveau client
  Object.values(pixels).forEach((pixelEvent) => {
    ws.send(JSON.stringify(pixelEvent));
  });

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.kind === 1) {
        // Extraire les données du pixel de l'événement
        const { x, y, color } = JSON.parse(parsedMessage.content);
        const eventTimestamp = parsedMessage.created_at;
        const pixelKey = `${x}-${y}`;

        // Mettre à jour le pixel seulement si l'événement est plus récent
        if (!pixels[pixelKey] || eventTimestamp > pixels[pixelKey].created_at) {
          // Mettre à jour ou ajouter l'événement pixel
          pixels[pixelKey] = parsedMessage;
          
          // Stocker l'événement dans le tableau des événements
          events.push(parsedMessage);

          // Diffuser l'événement à tous les clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(parsedMessage));
            }
          });
        }
      } else if (parsedMessage.kind === 'REQ') {
        // Retourner les événements demandés
        const subscriptionId = parsedMessage.id;
        events.forEach(event => {
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
