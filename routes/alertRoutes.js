const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Acil durum bildirim yönetimi
 */

/**
 * @swagger
 * /api/alert/manual:
 *   post:
 *     summary: Kullanıcının manuel olarak acil durum bildirimi göndermesini sağlar
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acil durum bildirimi gönderildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acil durum bildirimi gönderildi."
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/manual', authMiddleware, alertController.sendManualAlert);

/**
 * @swagger
 * /api/alert/respond:
 *   post:
 *     summary: Kullanıcının acil durum bildirimine yanıt vermesini sağlar
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertId
 *             properties:
 *               alertId:
 *                 type: integer
 *                 description: Yanıtlanacak acil durum bildiriminin ID'si
 *             example:
 *               alertId: 1
 *     responses:
 *       200:
 *         description: Acil durum bildiriminize yanıt verildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acil durum bildiriminize yanıt verildi."
 *       400:
 *         description: alertId gerekli veya zaten yanıtlandı.
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Acil durum bildirimi bulunamadı
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/respond', authMiddleware, alertController.respondAlert);

/**
 * @swagger
 * /api/alert/ai-integration:
 *   post:
 *     summary: Yapay zeka entegrasyonu için acil durum bildirimi tetikler
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 description: Yapay zeka modelinden gelen veri
 *             example:
 *               data:
 *                 key: "value"
 *     responses:
 *       200:
 *         description: Yapay zeka entegrasyonu başarılı.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yapay zeka entegrasyonu başarılı."
 *       400:
 *         description: Geçersiz istek verisi.
 *       401:
 *         description: Yetkisiz erişim.
 *       500:
 *         description: Sunucu Hatası.
 */
router.post('/ai-integration', authMiddleware, alertController.aiIntegration);


/**
 * @swagger
 * /api/alert/send-sms:
 *   post:
 *     summary: Belirtilen numaralara toplu SMS gönderir
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [numbers, message]
 *             properties:
 *               numbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Telefon numaraları (0XXX veya 9XXXXXXXX formatında)
 *               message:
 *                 type: string
 *                 description: Gönderilecek SMS içeriği
 *             example:
 *               numbers: ["05345701578","905312345678"]
 *               message: "Bu bir test SMS’idir."
 *     responses:
 *       200:
 *         description: SMS gönderim sonuçları
 */
router.post('/send-sms', authMiddleware, alertController.sendCustomSMS);

module.exports = router;
