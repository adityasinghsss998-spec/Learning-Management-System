const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

const thumbnailUpload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, `thumbnails/${req.headers['x-user-id']}_${Date.now()}_${file.originalname}`);
        },
    }),
});

const lessonUpload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, `lessons/${req.params.courseId}_${Date.now()}_${file.originalname}`);
        },
    }),
});

module.exports = { thumbnailUpload, lessonUpload };