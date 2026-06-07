const Course = require('../models/course');

class Courserepository {
    async create(data) {
        try {
            const course = await Course.create(data);
            return course;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async findAll(filter, sort) {
        try {
            const courses = await Course.find(filter).sort(sort);
            return courses;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async findById(id) {
        try {
            const course = await Course.findById(id);
            return course;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async findByInstructor(instructorId) {
        try {
            const courses = await Course.find({ instructorId });
            return courses;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async updateById(id, data) {
        try {
            const course = await Course.findByIdAndUpdate(id, data, { new: true });
            return course;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async deleteById(id) {
        try {
            await Course.findByIdAndDelete(id);
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async incrementStudents(id) {
        try {
            const course = await Course.findByIdAndUpdate(
                id,
                { $inc: { totalStudents: 1 } },
                { new: true }
            );
            return course;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }
}

module.exports = { Courserepository };