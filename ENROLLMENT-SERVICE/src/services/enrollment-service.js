const {Enrollmentrepository} = require('../repository/enrollment-repo');
const crypto = require('crypto');
const { courseClient } = require('../config/axios');
const razorpay = require('../config/razorpay');
const dotenv = require('dotenv');
let channel;
const amqp = require('amqplib');
const getRabbitChannel = async () => {
    if (channel) return channel;
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    return channel;
};

const publish = async (queue, data) => {
    const ch = await getRabbitChannel();
    await ch.assertQueue(queue, { 
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
            'x-dead-letter-routing-key': queue, 
        }
    });
    
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
};

class EnrollmentService{
    constructor(){
      this.repo=new Enrollmentrepository();
    }
   
    async checkout(studentId,CourseId){
      try{
        const student=await this.repo.findOne(studentId,CourseId);
        console.log(student)
        if(student){
          throw new Error ("Aleady enrolled in this course")
        }
       const { data: responseBody } = await courseClient.get(`/${CourseId}`);
        const course = responseBody.data;
        if(!course) throw new Error("course does not exist");
        if(course.price==0){
          return {
            free:true,
            CourseId,
            price:0
          }
        }

        const shortStudent = studentId.toString().slice(-8);
        const shortCourse = CourseId.toString().slice(-8);

        const order=await razorpay.orders.create({
           amount: course.price * 100,
           currency: "INR",
           receipt: `receipt_${shortStudent}_${shortCourse}`,
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
          const body = orderId+"|"+paymentId;
          const expected = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest("hex");
          

           console.log("--- SECURITY CHECK ---");
  
          if (expected!==signature) throw new Error("Payment verification failed");
          const { data: responseBody } = await courseClient.get(`/${courseId}`);
          const course = responseBody.data;

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

          await courseClient.patch(`/${courseId}/students/increment`);
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
            console.log("🕵️ AXIOS IS GOING TO:", courseClient.defaults.baseURL + `/api/v1/courses/${courseId}`)
            const { data: coursedata } = await courseClient.get(
                `${courseId}`
            );
            const course=coursedata.data;
            console.log(course)
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

            await courseClient.patch(`${courseId}/students/increment`);

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

     async updateProgress(studentId, StudentName,courseId, lessonId) {
        try {
            const enrollment = await this.repo.findOne(studentId, courseId);
            if (!enrollment) throw new Error("Enrollment not found");

            enrollment.updateProgress(lessonId);

            if (enrollment.isFullyCompleted()) {
                enrollment.completed = true;
                enrollment.completedAt = new Date();
                const { data: responseBody } = await courseClient.get(`/${courseId}`);
                const course = responseBody.data;

                await publish("certificate.generate", {
                    studentId,
                    courseId,
                    studentName:StudentName,
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