const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const wavDecoder = require('wav-decoder');
const ffmpegStatic = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

// fluent-ffmpeg'e statik ffmpeg yolunu tanıt
ffmpeg.setFfmpegPath(ffmpegStatic);

async function decodeBase64ToFloatArray(base64Str) {
  // 1) Base64 → gelen ham dosya
  const tmpBase = path.join(os.tmpdir(), uuidv4());
  fs.writeFileSync(tmpBase, Buffer.from(base64Str, 'base64'));

  // 2) FFmpeg ile PCM WAV'a dönüştür
  const wavPath = tmpBase + '.wav';
  await new Promise((resolve, reject) => {
    ffmpeg(tmpBase)
      .outputOptions([
        '-ac 1',        // mono
        '-ar 16000',    // 16kHz
        '-f wav'        // WAV format
      ])
      .save(wavPath)
      .on('end', resolve)
      .on('error', reject);
  });

  // 3) WAV'ı oku ve decode et
  const wavBuffer = fs.readFileSync(wavPath);
  const audioData = await wavDecoder.decode(wavBuffer);

  // 4) Mono değilse ortala
  const floatArray = (audioData.channelData.length === 1)
    ? audioData.channelData[0]
    : audioData.channelData[0].map((v, i) => (v + audioData.channelData[1][i]) / 2);

  // 5) Cleanup
  try {
    fs.unlinkSync(tmpBase);
    fs.unlinkSync(wavPath);
  } catch {}

  console.log('✅ Decode tamam, float[0..9]:', floatArray.slice(0, 10));
  return floatArray;
}

module.exports = { decodeBase64ToFloatArray };
