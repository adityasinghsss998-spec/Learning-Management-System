const course = require('../models/course');
const {CourseService} =require('../services/course-service');
const courseService=new CourseService();
const { S3Client } = require('@aws-sdk/client-s3');
const createCourse=async(req,res)=>{
  try{
    const userid=req.headers['x-user-id'];
    const username=req.headers['x-user-name'];
     console.log("Headers received:", {
            userId: req.headers['x-user-id'],
            userName: req.headers['x-user-name'],
            userRole: req.headers['x-user-role'],
        });
    const course=await courseService.create(userid,username,req.body);
    return res.status(200).json({
      data:course,
      err:{},
      message:"Course created successfully"
    })
  }catch(e){
    res.status(400).json({
      data:{},
      message:e.message,
      err:"Something is wrong in the controllers"
    })
  }
}

const getAllCourses=async(req,res)=>{
  try{
     const courses=await courseService.getALLCourses(req.query);
     return res.status(200).json({
      data:courses,
      err:{},
      message:"Successfully got the courses"
     })
  }catch(e){
    res.status(400).json({
      data:{},
      message:e.message,
      err:"Something is wrong in the controllers"
    })
}
}

const getCourseById = async (req, res) => {
    try {
        const result = await courseService.getCourseById(req.params.id);
      return res.status(200).json({
      data:result,
      err:{},
      message:"Successfully got the courses"
     })
    } catch (e) {
      res.status(400).json({
      data:{},
      message:e.message,
      err:"Something is wrong in the controllers"
    })
    }
}

const getInstructorCourses = async (req, res) => {
    try {
        const result = await courseService.getInstructorCourses(
            req.headers['x-user-id']
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const result = await courseService.updateCourse(
            req.params.id,
            req.headers['x-user-id'],
            req.body
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const addSection=async(req,res)=>{
  try{
    const response=await courseService.addSection(
      req.params.id,
      req.headers['x-user-id'],
      req.body
    )
     return res.status(200).json({
      data:response,
      err:{},
      message:"Successfully got the courses"
     })
  }catch (e) {
      res.status(400).json({
      data:{},
      message:e.message,
      err:"Something is wrong in the controllers"
    })
    }
}
const addLesson=async(req,res)=>{
  try{
      const contentUrl=req.file?.location;
      const response=await courseService.addLesson(
        req.params.courseId,
        req.params.sectionId,
        req.headers['x-user-id'],
        {...req.body,contentUrl}
      )
    return res.status(200).json({
      data:response,
      err:{},
      message:"lesson added successfully"
    })
  }catch(e){
    
    res.status(400).json({
      data:{},
      message:e.message,
      err:"Something is wrong in the controllers"
    })
  }
}
const incrementStudents = async (req, res) => {
    try {
        await courseService.incrementStudents(req.params.id)
        res.status(200).json({ message: "Student count updated" });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
const deleteCourse = async (req, res) => {
    try {
        await courseService.deleteCourse(req.params.id, req.headers['x-user-id']);
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
const togglePublish = async (req, res) => {
    try {
        console.log("reached")
        const result = await courseService.togglePublish(
            req.params.id,
            req.headers['x-user-id']
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
const updateThumbnail = async (req, res) => {
    try {
        const thumbnailUrl = req.file?.location;
        if (!thumbnailUrl) throw new Error("No file uploaded");
        const result = await courseService.updateThumbnail(
            req.params.id,
            req.headers['x-user-id'],
            thumbnailUrl
        );
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    getInstructorCourses,
    updateCourse,
    updateThumbnail,
    togglePublish,
    deleteCourse,
    addSection,
    addLesson,
    incrementStudents,
};