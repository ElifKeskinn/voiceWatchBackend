// services/aiService.js
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

let modelPromise = null;

/**
 * GraphModel formatındaki modeli yükler (bir kere).
 */
function loadModel() {
  if (modelPromise) return modelPromise;
  const modelPath = 'file://' + path.resolve(__dirname, '../tfjs_model/model.json');
  modelPromise = tf.loadGraphModel(modelPath)
    .then(m => {
      console.log('✅ TF.js GraphModel yüklendi:', modelPath);
      return m;
    })
    .catch(err => {
      console.error('❌ GraphModel yüklerken hata:', err);
      throw err;
    });
  return modelPromise;
}

/**
 * Mel-spektral veriden tahmin alır.
 * @param {number[][]} spectrogram - [128][timeSteps] boyutlu dizi
 * @returns {Promise<number[]>} - Sınıf olasılıkları
 */
async function predictFromSpectrogram(spectrogram) {
  const model = await loadModel();

  // Girdi doğrulaması
  if (
    !Array.isArray(spectrogram) ||
    !Array.isArray(spectrogram[0]) ||
    spectrogram.length !== 128
  ) {
    throw new Error('Geçersiz veri: [128][timeSteps] boyutunda Mel-spektral veri bekleniyor.');
  }

  const timeSteps = spectrogram[0].length;

  // 1) İki boyutlu tensor oluştur: [128, timeSteps]
  const tensor2d = tf.tensor(spectrogram, [128, timeSteps], 'float32');
  // 2) Batch boyutunu ekle: [1, 128, timeSteps]
  const inputTensor = tensor2d.expandDims(0);

  // 3) GraphModel için executeAsync
  const outputTensor = await model.executeAsync(inputTensor);
  const probs = await outputTensor.data();

  return Array.from(probs);
}

module.exports = { loadModel, predictFromSpectrogram };
