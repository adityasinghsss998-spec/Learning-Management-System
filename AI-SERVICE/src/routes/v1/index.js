const router = require('express').Router();
const controller = require('../../controllers/ai-controller');

router.post('/describe', controller.describeCourse);
router.post('/summarize', controller.summarizeLesson);
router.post('/suggest', controller.suggestCourses);

module.exports = router;