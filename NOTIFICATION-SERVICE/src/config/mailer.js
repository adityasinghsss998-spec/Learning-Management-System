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

const sendEnrollmentEmail = async (studentEmail, courseTitle) => {
    await transporter.sendMail({
        from: `"Nexus" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: `You're enrolled in ${courseTitle} 🎉`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
                <div style="margin-bottom:24px;">
                    <div style="display:inline-flex;align-items:center;gap:8px;">
                        <div style="width:28px;height:28px;background:#4f46e5;border-radius:8px;text-align:center;line-height:28px;">
                            <span style="color:#fff;font-size:13px;font-weight:700;">N</span>
                        </div>
                        <span style="font-size:16px;font-weight:700;color:#1e1b4b;">Nexus</span>
                    </div>
                </div>
                <h1 style="font-size:22px;font-weight:700;color:#1e1b4b;margin:0 0 8px;">
                    You're enrolled! 🎉
                </h1>
                <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    You've successfully enrolled in <strong style="color:#4f46e5;">${courseTitle}</strong>.
                    Start learning at your own pace and track your progress on your dashboard.
                </p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                    Go to Dashboard →
                </a>
                <p style="color:#94a3b8;font-size:13px;margin:32px 0 0;">
                    Happy learning! — The Nexus Team
                </p>
            </div>
        `,
    });
};

const sendCertificateEmail = async (studentEmail, studentName, courseTitle, certificateUrl) => {
    await transporter.sendMail({
        from: `"Nexus" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: `Your certificate is ready — ${courseTitle} 🎓`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
                <div style="margin-bottom:24px;">
                    <div style="display:inline-flex;align-items:center;gap:8px;">
                        <div style="width:28px;height:28px;background:#4f46e5;border-radius:8px;text-align:center;line-height:28px;">
                            <span style="color:#fff;font-size:13px;font-weight:700;">N</span>
                        </div>
                        <span style="font-size:16px;font-weight:700;color:#1e1b4b;">Nexus</span>
                    </div>
                </div>
                <h1 style="font-size:22px;font-weight:700;color:#1e1b4b;margin:0 0 8px;">
                    Congratulations, ${studentName}! 🎉
                </h1>
                <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    You've successfully completed <strong style="color:#4f46e5;">${courseTitle}</strong>.
                    Your certificate of completion is ready to download.
                </p>
                <a href="${certificateUrl}"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:12px;">
                    Download Certificate →
                </a>
                <p style="color:#64748b;font-size:13px;margin:8px 0 32px;">
                    Share your achievement on LinkedIn and let the world know!
                </p>
                <p style="color:#94a3b8;font-size:13px;margin:0;">
                    Keep learning — The Nexus Team
                </p>
            </div>
        `,
    });
};

module.exports = { sendEnrollmentEmail, sendCertificateEmail };