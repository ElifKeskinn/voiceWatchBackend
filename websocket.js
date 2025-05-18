const WebSocket = require('ws');
const tfService = require('./services/aiService');
const { decodeBase64ToFloatArray } = require('./services/audioDecodeService');
const { generateMelSpectrogram } = require('./services/melService');
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
    await tfService.loadModel();

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch (e) {
        return ws.send(JSON.stringify({ action: 'aiError', message: 'Invalid JSON' }));
      }

      if (msg.action === 'aiIntegration' && typeof msg.data === 'string') {
        try {
          const floatAudio = await decodeBase64ToFloatArray(msg.data);
          const mel = await generateMelSpectrogram(floatAudio);
          const probs = await tfService.predictFromSpectrogram(mel);

          const maxVal = Math.max(...probs);
          const idx = probs.indexOf(maxVal);

          const result = maxVal < 0.5 ? 'safe' : CATEGORIES[idx];

          ws.send(JSON.stringify({
            action: 'aiResult',
            result,
            prediction: probs // dilersen frontend de görebilir
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
