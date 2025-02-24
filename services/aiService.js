const tf = require('@tensorflow/tfjs-node');

let model;
let modelLoadingPromise = null;

// Modeli asenkron olarak yükleyen fonksiyon.
// Eğer model zaten yükleniyorsa, yükleme promise'ını döndürür.
const loadModel = async () => {
    if (modelLoadingPromise) {
        return modelLoadingPromise;
    }
    modelLoadingPromise = (async () => {
        try {
            model = await tf.loadLayersModel('file://tfjs_model/model.json');
            console.log('✅ Yapay zeka modeli başarıyla yüklendi.');
            return model;
        } catch (error) {
            console.error('❌ Model yüklenirken hata oluştu:', error);
            throw error;
        }
    })();
    return modelLoadingPromise;
};

// MFCC özellik vektöründen tahmin yapma fonksiyonu.
// "data" parametresi [40] boyutlu bir dizi (örneğin, MFCC özellik vektörü) olmalıdır.
const predictFromMFCC = async (data) => {
    // Model yüklü değilse, yüklenmesini bekle.
    if (!model) {
        await loadModel();
    }
    if (!Array.isArray(data) || data.length !== 40) {
        throw new Error('Geçersiz MFCC veri formatı. 40 uzunluğunda bir dizi bekleniyor.');
    }
    try {
        // Gelen veriyi tensor'a çevirip uygun şekle getiriyoruz.
        const inputTensor = tf.tensor(data).reshape([1, 40, 1]);
        const prediction = model.predict(inputTensor);
        const result = await prediction.data(); // Asenkron veri çekme
        return Array.from(result);
    } catch (err) {
        console.error('❌ Yapay zeka tahmin hatası:', err);
        throw new Error('Tahmin işlemi sırasında hata oluştu.');
    }
};

module.exports = { loadModel, predictFromMFCC };
