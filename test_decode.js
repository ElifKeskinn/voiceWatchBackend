// test_decode.js
const fs = require('fs');
const { decodeBase64ToFloatArray } = require('./services/audioDecodeService');

async function main() {
  const b64 = fs.readFileSync('test.m4a.base64', 'utf-8');
  const floats = await decodeBase64ToFloatArray(b64);
  console.log("🔊 İlk 10 örnek:", floats.slice(0, 10));
  console.log("🔊 Toplam örnek sayısı:", floats.length);
}

main().catch(console.error);
/*
test için:
 python make_base64.py test.m4a test.m4a.base64  
 node "c:\voiceWatch-backend\test_decode.js"
 node "c:\voiceWatch-backend\meltest.js"
 swagger.json endpoint testi
*/