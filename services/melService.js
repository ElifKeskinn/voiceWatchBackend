const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

async function generateMelSpectrogram(floatAudio) {
  // 1) Geçici JSON dosyası oluştur
  const tmpBase = path.join(os.tmpdir(), uuidv4());
  const tmpJson = tmpBase + '.json';
  const tmpMel  = tmpBase + '_mel.json';
  fs.writeFileSync(tmpJson, JSON.stringify([...floatAudio]), 'utf-8');

  // 2) Python komutunu platforma göre belirle
  const PY = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

  // 3) Python script’i, input ve output dosya parametreleriyle çağır
  await new Promise((resolve, reject) => {
    const python = spawn(PY, [
      path.join(__dirname, '../mel_generator.py'),
      tmpJson,
      tmpMel
    ], { stdio: 'inherit' });

    python.on('error', err => reject(err));
    python.on('close', code => code === 0 ? resolve() : reject(new Error(`Python exited ${code}`)));
  });

  // 4) Çıkış dosyasını oku, JSON parse et
  const mel = JSON.parse(fs.readFileSync(tmpMel, 'utf-8'));

  // 5) Temizlik
  try { fs.unlinkSync(tmpJson); fs.unlinkSync(tmpMel); } catch {}

  return mel;
}

module.exports = { generateMelSpectrogram };
