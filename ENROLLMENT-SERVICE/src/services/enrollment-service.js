const {Enrollmentrepository} = require('../repository/enrollment-repo');
const crypto = require('crypto');
const { courseClient } = require('../config/axios');
const razorpay = require('../config/razorpay');
const dotenv = require('dotenv');
let channel;

const getRabbitChannel = async () => {
    if (channel) return channel;
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    return channel;
};

const publish = async (queue, data) => {
    const ch = await getRabbitChannel();
    await ch.assertQueue(queue, { durable: true });
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
};

class EnrollmentService{
    constructor(){
      this.repo=new Enrollmentrepository();
    }
   
    async checkout(studentId,CourseId){
      try{
        const student=await this.repo.findByStudent(studentId,CourseId);
        if(existing){
          throw new Error ("Aleady enrolled in this course")
        }
        
        const {data:course} = await courseClient.get('/api/v1/courses/${CourseId}')

        if(!course) throw new Error("course does not exist");
        if(course.price==0){
          return {
            free:true,
            CourseId,
            price:0
          }
        }
        const order=await razorpay.orders.create({
           amount: course.price * 100,
           currency: "INR",
           receipt: `receipt_${studentId}_${courseId}`,
        })

         return {
                free: false,
                orderId: order.id,
                amount: course.price,
                currency: "INR",
                courseTitle: course.title,
                keyId: process.env.RAZORPAY_KEY_ID,
            };
          }catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

    async verifyAndEnroll(studentId, courseId, orderId, paymentId, signature) {
      try{
          const body = orderId + "|" + paymentId;
          const expected = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest("hex");

          if (expected!==signature) throw new Error("Payment verification failed");
          const { data: course } = await courseClient.get(
                `/api/v1/courses/${courseId}`
            );

            const allLessons = course.sections.flatMap((s) =>
                s.lessons.map((l) => ({
                    lessonId: l._id.toString(),
                    completed: false,
                }))
            );

            const enrollment = await this.repo.create({
                studentId,
                courseId,
                progress: allLessons,
                totalLessons: allLessons.length,
                payment: {
                    orderId,
                    paymentId,
                    status: "paid",
                    amount: course.price,
                },
            });

          await courseClient.patch(`/api/v1/courses/${courseId}/students/increment`);
          await publish("enrollment.created", {
                studentId,
                courseId,
                courseTitle: course.title,
            });

            return enrollment;
      }catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

     async enrollFree(studentId, courseId) {
        try {
            const existing = await this.repo.findOne(studentId, courseId);
            if (existing) throw new Error("Already enrolled in this course");

            const { data: course } = await courseClient.get(
                `/api/v1/courses/${courseId}`
            );
            if (!course) throw new Error("Course not found");
            if (course.price !== 0) throw new Error("This is a paid course");

            const allLessons = course.sections.flatMap((s) =>
                s.lessons.map((l) => ({
                    lessonId: l._id.toString(),
                    completed: false,
                }))
            );

            const enrollment = await this.repo.create({
                studentId,
                courseId,
                progress: allLessons,
                totalLessons: allLessons.length,
                payment: { status: "free", amount: 0 },
            });

            await courseClient.patch(`/api/v1/courses/${courseId}/students/increment`);

            await publish("enrollment.created", {
                studentId,
                courseId,
                courseTitle: course.title,
            });

            return enrollment;
          }catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
 }

    async getMyEnrollments(studentId) {
        try {
            return await this.repo.findByStudent(studentId);
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

     async updateProgress(studentId, courseId, lessonId) {
        try {
            const enrollment = await this.repo.findOne(studentId, courseId);
            if (!enrollment) throw new Error("Enrollment not found");

            enrollment.updateProgress(lessonId);

            if (enrollment.isFullyCompleted()) {
                enrollment.completed = true;
                enrollment.completedAt = new Date();

                const { data: course } = await courseClient.get(
                    `/api/v1/courses/${courseId}`
                );

                await publish("certificate.generate", {
                    studentId,
                    courseId,
                    courseTitle: course.title,
                    enrollmentId: enrollment._id,
                });
            }
             await enrollment.save();
            return enrollment;
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
}

     async writeCertificate(enrollmentId, certificateUrl) {
        try {
            const enrollment = await this.repo.findById(enrollmentId);
            if (!enrollment) throw new Error("Enrollment not found");
            return await this.repo.updateById(enrollmentId, { certificateUrl });
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
}
module.exports = { EnrollmentService };