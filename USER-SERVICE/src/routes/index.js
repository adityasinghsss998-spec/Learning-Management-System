const router = require('express').Router();
const controller = require('../controllers/user-controller');
const upload = require('../middlewares/upload');

router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);
router.patch('/avatar', upload.single('avatar'), controller.updateAvatar);

module.exports = router;