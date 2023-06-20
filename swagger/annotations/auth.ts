/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth management endpoints
 * components:
 *   schemas:
 *     TUser:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         nickname:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         email_is_verified:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signs up a user (REGISTER)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 require: true
 *               last_name:
 *                 type: string
 *                 require: true
 *               middle_name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 require: true
 *               email:
 *                 type: string
 *                 require: true
 *               login_passcode:
 *                 type: string
 *                 require: true
 *     responses:
 *       201:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TUser'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Signs in a user (LOGIN)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 require: true
 *               login_passcode:
 *                 type: string
 *                 require: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TUser'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid request body OR Invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/signout:
 *   get:
 *     summary: Signs out a user ((SIGNOUT) Clears the token in the cookie of the Browser)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/forgot-login-passcode:
 *   post:
 *     summary: Sends a OTP to the user's email (FORGOT PASSWORD)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 require: true
 *               email:
 *                 type: string
 *                 require: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/reset-login-passcode:
 *   post:
 *     summary: Resets the user's login passcode (RESET PASSWORD)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_login_passcode:
 *                 type: string
 *                 require: true
 *               one_time_password:
 *                 type: string
 *                 require: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request body or Invalid OTP
 *       500:
 *         description: Internal server error
 */
