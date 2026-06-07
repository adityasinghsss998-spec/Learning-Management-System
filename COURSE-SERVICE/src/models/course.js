const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        contentUrl: { type: String, required: true },
        contentType: { type: String, enum: ["video", "pdf", "article"], required: true },
        duration: { type: Number, default: 0 },
        isPreview: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const sectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        order: { type: Number, required: true },
        lessons: [lessonSchema],
    },
    { timestamps: true }
);

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        instructorId: { type: String, required: true },
        instructorName: { type: String, required: true },
        thumbnail: { type: String, default: "" },
        price: { type: Number, default: 0 },
        category: {
            type: String,
            enum: ["development", "design", "business", "marketing", "other"],
            default: "other",
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        sections: [sectionSchema],
        isPublished: { type: Boolean, default: false },
        totalStudents: { type: Number, default: 0 },
    },
    { timestamps: true }
);

courseSchema.index({ title: "text", description: "text" });

courseSchema.methods.isOwnedBy = function (instructorId) {
    return this.instructorId === instructorId;
};

courseSchema.methods.toSummary = function () {
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        instructorName: this.instructorName,
        thumbnail: this.thumbnail,
        price: this.price,
        category: this.category,
        level: this.level,
        totalStudents: this.totalStudents,
        totalSections: this.sections.length,
        totalLessons: this.sections.reduce((acc, s) => acc + s.lessons.length, 0),
        isPublished: this.isPublished,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model("Course", courseSchema);