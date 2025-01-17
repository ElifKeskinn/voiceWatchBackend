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
 *     summary: Register a new user
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
 *               - password
 *               - bloodGroup
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               tcKimlik:
 *                 type: string
 *               age:
 *                 type: integer
 *               password:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               emergencyContacts:
 *                 type: array
 *                 items:
 *                   type: string
 *               profilePic:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: TC Kimlik Numarası already exists
 *       500:
 *         description: Server Error
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
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
 *         description: JWT Token
 *       400:
 *         description: Invalid TC Kimlik Numarası or password
 *       500:
 *         description: Server Error
 */
router.post('/login', authController.login);

module.exports = router;
