const PDFDocument = require('pdfkit');
const { Upload } = require('@aws-sdk/lib-storage');
const s3 = require('./s3');
const dotenv = require('dotenv');

dotenv.config();

const generateCertificate = (enrollmentId, studentName, courseTitle, completedAt) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', async () => {
                try {
                    const pdfBuffer = Buffer.concat(buffers);
                    const key = `certificates/${enrollmentId}.pdf`;

                    const upload = new Upload({
                        client: s3,
                        params: {
                            Bucket: process.env.S3_BUCKET,
                            Key: key,
                            Body: pdfBuffer,
                            ContentType: 'application/pdf',
                        },
                    });

                    await upload.done();

                    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
                    resolve(url);
                } catch (err) {
                    reject(err);
                }
            });

            doc.on('error', reject);

            const W = 841.89;
            const H = 595.28;

            doc.rect(0, 0, W, H).fill('#ffffff');

            doc.rect(0, 0, W, 6).fill('#4f46e5');
            doc.rect(0, H - 6, W, 6).fill('#4f46e5');
            doc.rect(0, 0, 6, H).fill('#4f46e5');
            doc.rect(W - 6, 0, 6, H).fill('#4f46e5');

            doc.rect(20, 20, W - 40, H - 40)
                .lineWidth(0.5)
                .strokeColor('#e0e7ff')
                .stroke();

            doc.rect(40, 40, W - 80, H - 80)
                .lineWidth(0.3)
                .strokeColor('#e0e7ff')
                .stroke();

            doc.fontSize(11)
                .fillColor('#6366f1')
                .font('Helvetica-Bold')
                .text('NEXUS', 0, 70, {
                    align: 'center',
                    characterSpacing: 8,
                });

            doc.fontSize(28)
                .fillColor('#1e1b4b')
                .font('Helvetica-Bold')
                .text('Certificate of Completion', 0, 105, {
                    align: 'center',
                    characterSpacing: 1,
                });

            doc.moveTo(W / 2 - 60, 148)
                .lineTo(W / 2 + 60, 148)
                .lineWidth(1)
                .strokeColor('#c7d2fe')
                .stroke();

            doc.fontSize(11)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text('This is to proudly certify that', 0, 168, {
                    align: 'center',
                });

            doc.fontSize(36)
                .fillColor('#4f46e5')
                .font('Helvetica-BoldOblique')
                .text(studentName, 0, 195, {
                    align: 'center',
                });

            doc.moveTo(W / 2 - 140, 248)
                .lineTo(W / 2 + 140, 248)
                .lineWidth(0.5)
                .strokeColor('#c7d2fe')
                .stroke();

            doc.fontSize(11)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text('has successfully completed the course', 0, 262, {
                    align: 'center',
                });

            doc.fontSize(22)
                .fillColor('#1e1b4b')
                .font('Helvetica-Bold')
                .text(courseTitle, 60, 288, {
                    align: 'center',
                    width: W - 120,
                });

            const date = new Date(completedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            doc.fontSize(10)
                .fillColor('#9ca3af')
                .font('Helvetica')
                .text(`Completed on ${date}`, 0, 345, {
                    align: 'center',
                });

            doc.fontSize(9)
                .fillColor('#9ca3af')
                .text(`Certificate ID: ${enrollmentId}`, 0, 365, {
                    align: 'center',
                });

            doc.moveTo(80, H - 100)
                .lineTo(240, H - 100)
                .lineWidth(0.5)
                .strokeColor('#9ca3af')
                .stroke();

            doc.fontSize(9)
                .fillColor('#6b7280')
                .font('Helvetica-Bold')
                .text('Aditya Kumar', 80, H - 90, { width: 160, align: 'center' });

            doc.fontSize(8)
                .fillColor('#9ca3af')
                .font('Helvetica')
                .text('Founder, Nexus', 80, H - 78, { width: 160, align: 'center' });

            doc.moveTo(W - 240, H - 100)
                .lineTo(W - 80, H - 100)
                .lineWidth(0.5)
                .strokeColor('#9ca3af')
                .stroke();

            doc.fontSize(9)
                .fillColor('#6b7280')
                .font('Helvetica-Bold')
                .text('Nexus Platform', W - 240, H - 90, { width: 160, align: 'center' });

            doc.fontSize(8)
                .fillColor('#9ca3af')
                .font('Helvetica')
                .text('nexus.learning', W - 240, H - 78, { width: 160, align: 'center' });

            doc.fontSize(8)
                .fillColor('#c7d2fe')
                .font('Helvetica')
                .text('NEXUS · LEARN WITHOUT LIMITS', 0, H - 30, {
                    align: 'center',
                    characterSpacing: 3,
                });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateCertificate };