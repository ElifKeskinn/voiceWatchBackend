const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Yeni bir kullanıcı kaydeder
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - tcKimlik
 *               - age
 *               - phoneNumber
 *               - password
 *               - bloodGroup
 *               - emergencyContacts
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               tcKimlik:
 *                 type: Number
 *               age:
 *                 type: integer
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               emergencyContacts:
 *                 type: array
 *                 minItems: 2 # En az iki eleman olması gerektiğini belirtir
 *                 items:
 *                   type: object
 *                   required:
 *                     - contactNumber
 *                     - contactInfo
 *                   properties:
 *                     contactNumber:
 *                       type: string
 *                     contactInfo:
 *                       type: string
 *               profilePic:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu.
 *       400:
 *         description: TC Kimlik Numarası zaten mevcut veya geçersiz istek verisi.
 *       500:
 *         description: Sunucu Hatası.
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tcKimlik
 *               - password
 *             properties:
 *               tcKimlik:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT Token.
 *       400:
 *         description: Geçersiz TC Kimlik Numarası veya şifre.
 *       500:
 *         description: Sunucu Hatası.
 */
router.post('/login', authController.login);

module.exports = router;
