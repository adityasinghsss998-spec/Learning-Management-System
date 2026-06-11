const router = require('express').Router();
const controller = require('../../controllers/enrollment-controller');

router.post('/checkout', controller.checkout);
router.post('/verify-payment', controller.verifyAndEnroll);
router.post('/free', controller.enrollFree);
router.get('/my', controller.getMyEnrollments);
router.patch('/progress', controller.updateProgress);
router.patch('/certificate', controller.writeCertificate);

module.exports = router;