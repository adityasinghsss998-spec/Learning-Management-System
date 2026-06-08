const router = require('express').Router();
const controller = require('../../controllers/course-controller');
const { thumbnailUpload, lessonUpload } = require('../../middlewares/upload');

router.get('/', controller.getAllCourses);
router.get('/my', controller.getInstructorCourses);
router.get('/:id', controller.getCourseById);
router.post('/', controller.createCourse);
router.patch('/:id', controller.updateCourse);
router.patch('/:id/thumbnail', thumbnailUpload.single('thumbnail'), controller.updateThumbnail);
router.patch('/:id/publish', controller.togglePublish);
router.delete('/:id', controller.deleteCourse);
router.post('/:id/sections', controller.addSection);
router.post('/:courseId/sections/:sectionId/lessons', lessonUpload.single('content'), controller.addLesson);
router.patch('/:id/students/increment', controller.incrementStudents);

module.exports = router;