const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

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
 *      requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               age:
 *                 type: integer
 *               bloodGroup:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *             example:
 *               name: "Elif"
 *               surname: "Keskin"
 *               age: 26
 *               bloodGroup: "A+"
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
router.patch('/me', authMiddleware, upload.single('profilePic'), userController.updateProfile);

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


/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Kullanıcının şifresini sıfırlamak için reset kodu gönderir
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Kullanıcının telefon numarası
 *             example:
 *               phoneNumber: "05345701578"
 *     responses:
 *       200:
 *         description: Şifre sıfırlama kodu telefonunuza gönderildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Şifre sıfırlama kodu telefonunuza gönderildi."
 *       400:
 *         description: Telefon numarası gerekli veya kullanıcı bulunamadı.
 *       500:
 *         description: Sunucu Hatası.
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Reset kodunu doğrular ve yeni şifreyi ayarlar
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetCode
 *               - newPassword
 *             properties:
 *               resetCode:
 *                 type: string
 *                 description: Şifre sıfırlama kodu
 *               newPassword:
 *                 type: string
 *                 description: Yeni şifre
 *             example:
 *               resetCode: "123456"
 *               newPassword: "yeniSifre123"
 *     responses:
 *       200:
 *         description: Şifreniz başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Şifreniz başarıyla güncellendi."
 *       400:
 *         description: Reset kodu yanlış veya süresi dolmuş.
 *       500:
 *         description: Sunucu Hatası.
 */
router.post('/reset-password', userController.resetPassword);


/**
 * @swagger
 * /api/user/update-device-token:
 *   post:
 *     summary: Kullanıcının device tokenini günceller
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
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 description: Kullanıcının cihaz tokeni
 *             example:
 *               deviceToken: "abc123def456..."
 *     responses:
 *       200:
 *         description: Device token başarıyla güncellendi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Device token başarıyla güncellendi."
 *       400:
 *         description: deviceToken gerekli.
 *       401:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu Hatası
 */
router.post('/update-device-token', authMiddleware, userController.updateDeviceToken);

module.exports = router;