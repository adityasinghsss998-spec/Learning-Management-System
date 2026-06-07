const {Courserepository} =require('../repository/course-repo');
class CourseService{
  constructor(){
    this.repo=new Courserepository();
  }

  async create(instructorId,instructorName,data){
    try{
      const data=await this.repo.create({
        ...data,
        instructorId,
        instructorName
      })
      return data.toSummay();
    }catch(e){
      console.log("Something went wrong at the service layer", e);
      throw e;
    }
  }

  async getALLCourses({search,minprice,maxprice,sort,category,level}){
    try{
      const filter= {isPublished: true };

      if(search) filter.$text= {$search : search};
      if(category) filter.category=category;
      if(level) filter.level=level;
      if(minprice || maxprice){
        filter.price={}
        if(maxprice) filter.price.$gte=Number(maxprice)
        if(minprice) filter.price.$lte=Number(minprice)
      }
      const sortmap={
                newest: { createdAt: -1 },
                oldest: { createdAt: 1 },
                price_asc: { price: 1 },
                price_desc: { price: -1 },
                popular: { totalStudents: -1 },
      }
       const sortOption = sortMap[sort] || { createdAt: -1 };
       const course = await this.repo.findAll(filter,sortOption)
    }catch(e){
      console.log("Something went wrong at the service layer", e);
      throw e;
    }
  }
   async getCourseById(id) {
        try {
            const course = await this.repo.findById(id);
            if (!course) throw new Error("Course not found");
            return course;
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
    async getInstructorCourses(instructorId) {
        try {
            const courses = await this.repo.findByInstructor(instructorId);
            return courses.map((c) => c.toSummary());
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

    async updateCourse(id,data,instructorId){
       try{
          const course = await this.repo.findById(id);
          if(!course){
            throw new Error ("Course not found!!")
          }
          if(!course.isOwnedBy(instructorId)) {
            throw new Error ("You are not AUthorized")
          }
           const updated = await this.repo.updateById(id, data);
          return updated.toSummary();
       }catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
     async updateThumbnail(id, instructorId, thumbnailUrl) {
        try {
            const course = await this.repo.findById(id);
            if (!course) throw new Error("Course not found");
            if (!course.isOwnedBy(instructorId)) throw new Error("Unauthorized");
            const updated = await this.repo.updateById(id, { thumbnail: thumbnailUrl });
            return updated.toSummary();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
    async togglePublish(id, instructorId) {
        try {
            const course = await this.repo.findById(id);
            if (!course) throw new Error("Course not found");
            if (!course.isOwnedBy(instructorId)) throw new Error("Unauthorized");
            const updated = await this.repo.updateById(id, {
                isPublished: !course.isPublished,
            });
            return updated.toSummary();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
    async deleteCourse(id, instructorId) {
        try {
            const course = await this.repo.findById(id);
            if (!course) throw new Error("Course not found");
            if (!course.isOwnedBy(instructorId)) throw new Error("Unauthorized");
            await this.repo.deleteById(id);
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

}