const { EnrollmentService } = require('../services/enrollment-service');
const enrollmentService = new EnrollmentService();

const checkout = async (req, res) => {
    try {
        console.log(req.body.id,"-> course id")
        const result = await enrollmentService.checkout(
            req.headers['x-user-id'],
            req.body.id
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const verifyAndEnroll = async (req, res) => {
    try {
        const { courseId, orderId, paymentId, signature } = req.body;
        const result = await enrollmentService.verifyAndEnroll(
            req.headers['x-user-id'],
            courseId,
            orderId,
            paymentId,
            signature
        );
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const enrollFree = async (req, res) => {
    try {
        const result = await enrollmentService.enrollFree(
            req.headers['x-user-id'],
            req.body.courseId
        );
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getMyEnrollments = async (req, res) => {
    try {
        const result = await enrollmentService.getMyEnrollments(
            req.headers['x-user-id']
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateProgress = async (req, res) => {
    try {
        const result = await enrollmentService.updateProgress(
            req.headers['x-user-id'],
            req.body.courseId,
            req.body.lessonId
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const writeCertificate = async (req, res) => {
    try {
        const result = await enrollmentService.writeCertificate(
            req.body.enrollmentId,
            req.body.certificateUrl
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

module.exports = {
    checkout,
    verifyAndEnroll,
    enrollFree,
    getMyEnrollments,
    updateProgress,
    writeCertificate,
};