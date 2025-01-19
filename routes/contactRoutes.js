const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Acil durum kontak yönetimi
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - contactNumber
 *         - contactInfo
 *       properties:
 *         id:
 *           type: integer
 *           description: Kontakun benzersiz kimliği
 *         contactNumber:
 *           type: string
 *           description: Acil durum kontak numarası
 *         contactInfo:
 *           type: string
 *           description: Acil durum kontak bilgisi
 *         userId:
 *           type: integer
 *           description: Kullanıcının kimliği
 *       example:
 *         id: 1
 *         contactNumber: "05001234567"
 *         contactInfo: "Anne"
 *         userId: 1
 */

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Kullanıcının acil durum kontaklarını listeler
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı şekilde kontaklar listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.get('/', authMiddleware, contactController.getContacts);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Yeni bir acil durum kontak ekler
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactNumber
 *               - contactInfo
 *             properties:
 *               contactNumber:
 *                 type: string
 *                 description: Eklenen yeni kontak numarası
 *               contactInfo:
 *                 type: string
 *                 description: Eklenen kontak bilgisi
 *             example:
 *               contactNumber: "05007654321"
 *               contactInfo: "Baba"
 *     responses:
 *       201:
 *         description: Kontakt başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Geçersiz istek verisi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/', authMiddleware, contactController.addContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   patch:
 *     summary: Belirtilen ID'ye sahip acil durum kontakını günceller
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek kontakın ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactNumber:
 *                 type: string
 *                 description: Güncellenmiş kontak numarası
 *               contactInfo:
 *                 type: string
 *                 description: Güncellenmiş kontak bilgisi
 *             example:
 *               contactNumber: "05009876543"
 *               contactInfo: "Dede"
 *     responses:
 *       200:
 *         description: Kontakt başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Geçersiz istek verisi
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kontakt bulunamadı
 *       500:
 *         description: Sunucu Hatası
 */
router.patch('/:id', authMiddleware, contactController.updateContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Belirtilen ID'ye sahip acil durum kontakını siler
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek kontakın ID'si
 *     responses:
 *       200:
 *         description: Kontakt başarıyla silindi
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kontakt bulunamadı
 *       500:
 *         description: Sunucu Hatası
 */
router.delete('/:id', authMiddleware, contactController.deleteContact);

module.exports = router;
