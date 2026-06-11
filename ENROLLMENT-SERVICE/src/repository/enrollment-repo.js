const Enrollment=require('../models/enrollment');
class Enrollmentrepository{
    async create(data){
       try {
            const enrollment = await Enrollment.create(data);
            return enrollment;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }


   async findByStudent(studentId) {
        try {
            return await Enrollment.find({ studentId });
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }


    async findOne(studentId, courseId) {
        try {
            return await Enrollment.findOne({ studentId, courseId });
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

       async findById(id) {
        try {
            return await Enrollment.findById(id);
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }
     async updateById(id, data) {
        try {
            return await Enrollment.findByIdAndUpdate(id, data, { new: true });
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }
}

module.exports={
  Enrollmentrepository
}
