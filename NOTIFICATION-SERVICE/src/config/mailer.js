const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEnrollmentEmail = async (studentId, courseTitle) => {
    await transporter.sendMail({
        from: `"LMS Platform" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `You are enrolled in ${courseTitle}`,
        html: `
            <h2>Welcome to ${courseTitle}!</h2>
            <p>Hi Student,</p>
            <p>You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
            <p>Start learning now and track your progress on the dashboard.</p>
            <br/>
            <p>Happy Learning!</p>
            <p>LMS Team</p>
        `,
    });
};

const sendCertificateEmail = async (studentId, courseTitle, certificateUrl) => {
    await transporter.sendMail({
        from: `"LMS Platform" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `Certificate Ready — ${courseTitle}`,
        html: `
            <h2>Congratulations!</h2>
            <p>Hi Student,</p>
            <p>You have successfully completed <strong>${courseTitle}</strong>.</p>
            <p>Your certificate is ready. <a href="${certificateUrl}">Download it here</a>.</p>
            <br/>
            <p>Keep learning!</p>
            <p>LMS Team</p>
        `,
    });
};

module.exports = { sendEnrollmentEmail, sendCertificateEmail };