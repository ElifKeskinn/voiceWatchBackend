// websocket.js
const WebSocket = require('ws');
const path      = require('path');
const tfService = require('./services/aiService');
const CATEGORIES = ['glass_breaking', 'fall', 'silence', 'scream'];

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (ws) => {
    console.log('🟢 WS client connected');
    // Modeli önceden yükle
    await tfService.loadModel();

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch (e) {
        return ws.send(JSON.stringify({ action:'aiError', message:'Invalid JSON' }));
      }

      if (msg.action === 'aiIntegration' && Array.isArray(msg.data)) {
        try {
          const probs  = await tfService.predictFromSpectrogram(msg.data);
          const idx    = probs.indexOf(Math.max(...probs));
          const result = CATEGORIES[idx];

          ws.send(JSON.stringify({
            action: 'aiResult',
            result
          }));
        } catch (err) {
          console.error('❌ AI WS error:', err);
          ws.send(JSON.stringify({
            action: 'aiError',
            message: err.message
          }));
        }
      }
      
    });

    ws.on('close', () => {
      console.log('⚪️ WS client disconnected');
    });
  });
}

module.exports = { setupWebSocket };
