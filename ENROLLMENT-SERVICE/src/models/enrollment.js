const mongoose=require('mongoose');
const progressSchema=new mongoose.Schema({
  lessonId:{type:String,required:true},
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
})
const enrollmentSchema = new mongoose.Schema({
      studentId:{type:String,required:true},
      courseId:{type:String,required:true},
      progress:[progressSchema],
      completedLessons:{type:Number,default:0},
      totalLessons: { type: Number, default: 0 },
      progressPercent: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
      certificateUrl: { type: String, default: "" },
      payment: {
            orderId: { type: String, default: "" },
            paymentId: { type: String, default: "" },
            status: { type: String, enum: ["pending", "paid", "free"], default: "pending" },
            amount: { type: Number, default: 0 },
      },
},{ timestamps: true })
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

enrollmentSchema.methods.isFullyCompleted = function () {
    return this.completedLessons >= this.totalLessons && this.totalLessons > 0;
};

enrollmentSchema.methods.updateProgress = function (lessonId) {
    const document=this.progress.find((p)=> p.lessonId=lessonId);
    if(document && !document.completed){
      
    }
}

module.exports = mongoose.model("Enrollment", enrollmentSchema);