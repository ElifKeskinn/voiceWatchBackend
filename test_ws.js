// test_ws.js
const WebSocket = require('ws');
const melSpectrogram = require('./mel.json').data; // daha önce ürettiğiniz örnek JSON

const socket = new WebSocket('ws://localhost:5000');

socket.on('open', () => {
  console.log('WS bağlandı, istek atılıyor…');
  socket.send(JSON.stringify({ action: 'aiIntegration', data: melSpectrogram }));
});

socket.on('message', raw => {
  // 1) Buffer'ı string'e çevir
  const str = raw.toString();
  console.log('Raw mesaj:', str);

  // 2) JSON parse et
  const msg = JSON.parse(str);
  if (msg.action === 'aiResult') {
    console.log('Algılanan sınıf:', msg.result);  // “scream” vb.
  } else if (msg.action === 'aiError') {
    console.error('WS AI Error:', msg.message);
  }
  
  socket.close();
});

socket.on('error', err => {
  console.error('WS bağlanma hatası:', err);
});