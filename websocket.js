// websocket.js
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { predictFromMFCC, loadModel } = require('./services/aiService');

const wss = new WebSocket.Server({ noServer: true });
// noServer: true -> Express sunucusuyla upgrade event üzerinden paylaşmak için

// PCM veya WAV chunk verisini geçici olarak toplayacağımız buffer
// (Her client için ayrı buffer yönetimine ihtiyaç olabilir.)
let audioBuffer = [];

function setupWebSocket(server) {
  // Bu fonksiyon, Express sunucusuyla entegre olacak
  server.on('upgrade', (request, socket, head) => {
    // URL kontrolü veya authentication yapabilirsin (isteğe bağlı)
    // wss.handleUpgrade(...) diyerek WebSocket bağlantısını kur
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (ws) => {
    console.log('WebSocket client connected.');

    // Modeli önceden yükle (eğer daha önce loadModel çağırmadıysan)
    await loadModel();

    // Bu örnekte, 1 saniyede bir topladığımız ses verisinden MFCC çıkaracağız.
    const interval = setInterval(async () => {
      if (audioBuffer.length === 0) return;

      // 1) Buffer'ı lokalde al, global buffer'ı boşalt
      const currentData = Buffer.concat(audioBuffer);
      audioBuffer = [];

      try {
        // 2) Bu ham veriden (PCM veya mini .wav chunk) MFCC çıkar.
        const mfccArray = await extractMfccPython(currentData);

        if (!mfccArray || mfccArray.error) {
          console.error('MFCC extraction error:', mfccArray?.error);
          ws.send(JSON.stringify({ error: mfccArray?.error || 'MFCC error' }));
          return;
        }

        // 3) MFCC boyutu 40 mı? Modelimiz 40 MFCC bekliyor
        if (mfccArray.length !== 40) {
          ws.send(JSON.stringify({ error: 'MFCC length mismatch' }));
          return;
        }

        // 4) Tahmin al
        const prediction = await predictFromMFCC(mfccArray); // [pGlass, pFall, pScream, pSilence]
        const classes = ['glass_breaking', 'fall', 'scream', 'silence'];

        let maxVal = 0, maxIndex = 0;
        prediction.forEach((val, idx) => {
          if (val > maxVal) {
            maxVal = val;
            maxIndex = idx;
          }
        });

        // 5) Unknown eşiği
        const predictedClass = maxVal < 0.5 ? 'unknown' : classes[maxIndex];
        const response = {
          predicted_class: predictedClass,
          confidence: maxVal,
          timestamp: Date.now()
        };

        // 6) Sonucu client'a gönder
        ws.send(JSON.stringify(response));

      } catch (err) {
        console.error('Prediction error:', err);
        ws.send(JSON.stringify({ error: err.message }));
      }
    }, 1000); // 1 saniyede bir

    // Gelen veri parçalarını dinle
    ws.on('message', (chunk) => {
      // chunk -> Buffer (binary) olarak geliyor diyelim
      // Bunu audioBuffer'a push ediyoruz
      audioBuffer.push(chunk);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected.');
      clearInterval(interval);
      audioBuffer = [];
    });
  });
}

// Bu fonksiyon, ham PCM verisini bir Python script ile MFCC’ye çevirecek
async function extractMfccPython(bufferData) {
  return new Promise((resolve, reject) => {
    // Geçici bir dosyaya yaz
    const tempPath = path.join(__dirname, 'temp_audio.raw');
    fs.writeFileSync(tempPath, bufferData);

    const py = spawn('python', [
      path.join(__dirname, 'scripts', 'extract_mfcc_realtime.py'),
      tempPath,
      '16000' // örnek sample rate
    ]);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    py.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    py.on('close', (code) => {
      // temp dosya artık gerekmez
      fs.unlinkSync(tempPath);

      if (code !== 0) {
        return resolve({ error: stderr || 'Python script error' });
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { setupWebSocket };
