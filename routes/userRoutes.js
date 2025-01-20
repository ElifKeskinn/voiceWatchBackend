const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı profil yönetimi
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - tcKimlik
 *         - age
 *         - phoneNumber
 *         - bloodGroup
 *       properties:
 *         id:
 *           type: integer
 *           description: Kullanıcının benzersiz kimliği
 *         name:
 *           type: string
 *           description: Kullanıcının adı
 *         surname:
 *           type: string
 *           description: Kullanıcının soyadı
 *         tcKimlik:
 *           type: string
 *           description: TC Kimlik Numarası
 *         age:
 *           type: integer
 *           description: Kullanıcının yaşı
 *         phoneNumber:
 *           type: string
 *           description: Kullanıcının telefon numarası
 *         bloodGroup:
 *           type: string
 *           description: Kan grubu
 *         profilePic:
 *           type: string
 *           description: Profil resmi URL'si
 *         sensitivity:
 *           type: integer
 *           description: Hassasiyet ayarı
 *       example:
 *         id: 1
 *         name: "Elif"
 *         surname: "Keskin"
 *         tcKimlik: "12345678901"
 *         age: 25
 *         phoneNumber: "05001234567"
 *         bloodGroup: "A+"
 *         profilePic: "http://example.com/profile.jpg"
 *         sensitivity: 5
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Authenticated kullanıcının bilgilerini getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.get('/me', authMiddleware, userController.getMe);

/**
 * @swagger
 * /api/user/me:
 *   patch:
 *     summary: Authenticated kullanıcının profil bilgilerini günceller
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kullanıcının adı
 *               surname:
 *                 type: string
 *                 description: Kullanıcının soyadı
 *               age:
 *                 type: integer
 *                 description: Kullanıcının yaşı
 *               bloodGroup:
 *                 type: string
 *                 description: Kan grubu
 *               profilePic:
 *                 type: string
 *                 description: Profil resmi URL'si
 *             example:
 *               name: "Elif"
 *               surname: "Keskin"
 *               age: 26
 *               bloodGroup: "A+"
 *               profilePic: "http://example.com/new-profile.jpg"
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil başarıyla güncellendi."
 *       400:
 *         description: Geçersiz istek verisi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.patch('/me', authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Authenticated kullanıcının şifresini değiştirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Eski şifre
 *               newPassword:
 *                 type: string
 *                 description: Yeni şifre
 *             example:
 *               oldPassword: "password123"
 *               newPassword: "newPassword456"
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Şifre başarıyla değiştirildi."
 *       400:
 *         description: Eski şifre yanlış veya geçersiz istek verisi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/change-password', authMiddleware, userController.changePassword);


/**
 * @swagger
 * /api/user/delete-account:
 *   delete:
 *     summary: Authenticated kullanıcının hesabını siler (Soft Delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Hesabı silmek için şifre
 *             example:
 *               password: "currentPassword123"
 *     responses:
 *       200:
 *         description: Hesap başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hesabınız başarıyla silindi."
 *       400:
 *         description: Şifre yanlış veya geçersiz istek verisi
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;