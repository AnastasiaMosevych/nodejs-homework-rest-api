const express = require('express');
const ctrl = require('../../controllers/auth/auth');
const { validateBody, authenticate } = require('../../middlewares');
const { schemas } = require('../../models/user');
const router = express.Router();
const { upload } = require('../../middlewares');

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

router.get('/current', authenticate, ctrl.getCurrent);

router.post('/logout', authenticate, ctrl.logout);

router.patch('/avatars', authenticate, upload.single("avatar"), ctrl.setAvatar);

module.exports = router;