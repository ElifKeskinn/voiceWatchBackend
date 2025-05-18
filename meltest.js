const fs = require('fs');
const path = require('path');
const { decode } = require('wav-decoder');
const { spawn } = require('child_process');

async function run() {
  const wavPath = path.join(__dirname, 'cleaned.wav'); // PCM .wav dosyan
  const outputPath = path.join(__dirname, 'mel_example_swagger.json'); // Çıkacak JSON

  const wavBuffer = fs.readFileSync(wavPath);
  const audioData = await decode(wavBuffer);

  let floatArray;
  if (audioData.channelData.length === 1) {
    floatArray = audioData.channelData[0];
  } else {
    const left = audioData.channelData[0];
    const right = audioData.channelData[1];
    floatArray = left.map((v, i) => (v + right[i]) / 2);
  }

  const python = spawn('python', [path.join(__dirname, 'mel_generator.py')]);

  let data = '';
  python.stdout.on('data', chunk => data += chunk.toString());
  python.stderr.on('data', err => console.error('❌ Python Hatası:', err.toString()));
  python.on('close', () => {
    try {
      const mel = JSON.parse(data);
      const jsonToWrite = { data: mel };

      fs.writeFileSync(outputPath, JSON.stringify(jsonToWrite, null, 2), 'utf-8');
      console.log(`✅ mel_example_swagger.json başarıyla yazıldı: ${outputPath}`);
    } catch (err) {
      console.error('❌ MEL parse hatası:', err.message);
    }
  });

  python.stdin.write(JSON.stringify([...floatArray]));
  python.stdin.end();
}

run().catch(e => console.error('Hata:', e));
