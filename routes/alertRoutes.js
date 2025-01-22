// routes/alertRoutes.js

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
 *         description: Acil durum bildirimi alındı ve bildirim gönderiliyor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acil durum bildirimi alındı. Bildirim gönderiliyor."
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/manual', authMiddleware, alertController.manualAlert);

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

module.exports = router;
