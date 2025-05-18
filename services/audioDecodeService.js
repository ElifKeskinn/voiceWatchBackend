const fs = require('fs');
const path = require('path');
const { decode } = require('wav-decoder');

async function decodeBase64ToFloatArray(base64Str) {
  const wavBuffer = Buffer.from(base64Str, 'base64');

  const tempPath = path.join(__dirname, '../temp.wav');
  fs.writeFileSync(tempPath, wavBuffer);

  const fileBuffer = fs.readFileSync(tempPath);
  const audioData = await decode(fileBuffer);

  let floatArray;
  if (audioData.channelData.length === 1) {
    floatArray = audioData.channelData[0];
  } else {
    const left = audioData.channelData[0];
    const right = audioData.channelData[1];
    floatArray = left.map((v, i) => (v + right[i]) / 2);
  }

  console.log("✅ (Dosyadan) Float örnek (ilk 10):", floatArray.slice(0, 10));
  return floatArray;
}

module.exports = { decodeBase64ToFloatArray };
