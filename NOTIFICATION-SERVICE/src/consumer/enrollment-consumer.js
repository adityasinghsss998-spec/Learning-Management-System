const amqp = require('amqplib');
const { sendEnrollmentEmail, sendCertificateEmail } = require('../config/mailer');
const { enrollmentClient } = require('../config/axios');
const dotenv = require('dotenv');

dotenv.config();
const start=async ()=>{
  const conn=await amqp.connect(process.env.RABBITMQ_URL);
  const ch=await conn.createChannel();

  await ch.assertExchange('dlx', 'direct', { durable: true });
  await ch.assertQueue('dlq.enrollment.created', { durable: true });
  await ch.assertQueue('dlq.certificate.generate', { durable: true });
  await ch.bindQueue('dlq.enrollment.created', 'dlx', 'enrollment.created');
  await ch.bindQueue('dlq.certificate.generate', 'dlx', 'certificate.generate');
  
  await ch.assertQueue('enrollment.created', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
            'x-dead-letter-routing-key': 'enrollment.created',
        },
    });

    await ch.assertQueue('certificate.generate', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
            'x-dead-letter-routing-key': 'certificate.generate',
        },
    });

   ch.consume('enrollment.created',async(msg)=>{
     try{
       const { studentId, courseTitle } = JSON.parse(msg.content.toString());
       console.log(`Processing enrollment email for student: ${studentId}`);
       await sendEnrollmentEmail(studentId, courseTitle);
       console.log(`Enrollment email sent for: ${courseTitle}`);
        ch.ack(msg);
     }catch(e){
         console.log("Failed to process enrollment.created", e);
         ch.nack(msg, false, false);
     }
   })
    ch.consume('certificate.generate', async (msg) => {
        try {
            const { studentId, courseTitle, enrollmentId } = JSON.parse(
                msg.content.toString()
            );
            console.log(`Processing certificate for student: ${studentId}`);

            const certificateUrl = `https://certs.lms.com/${enrollmentId}.pdf`;

            await sendCertificateEmail(studentId, courseTitle, certificateUrl);
            console.log(`Certificate email sent for: ${courseTitle}`);

            await enrollmentClient.patch('/certificate', {
                enrollmentId,
                certificateUrl,
            });
            console.log(`Certificate URL written back for enrollment: ${enrollmentId}`);

            ch.ack(msg);
        } catch (e) {
            console.log("Failed to process certificate.generate", e);
            ch.nack(msg, false, false);
        }
    });

 console.log("Notification consumers running and listening...");
};

module.exports = { start };