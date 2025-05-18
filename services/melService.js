const { spawn } = require('child_process');
const path = require('path');

/**
 * Float32Array audio → Python ile mel-spectrogram çıkarır
 * @param {Float32Array} floatAudio
 * @returns {Promise<number[][]>} - [128][timeSteps] spectrogram
 */
function generateMelSpectrogram(floatAudio) {
  return new Promise((resolve, reject) => {
const python = spawn('python', [path.join(__dirname, '../mel_generator.py')]);


    let data = '';
    python.stdout.on('data', chunk => data += chunk.toString());
    python.stderr.on('data', err => reject('Python stderr: ' + err.toString()));
    python.on('close', () => {
      try {
        const mel = JSON.parse(data);
        resolve(mel);
      } catch (err) {
        reject('Mel parse hatası: ' + err.message);
      }
    });

    python.stdin.write(JSON.stringify([...floatAudio]));
    python.stdin.end();
  });
}

module.exports = { generateMelSpectrogram };
