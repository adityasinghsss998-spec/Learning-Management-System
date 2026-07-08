const { AiService } = require('../services/ai-service');
const aiService = new AiService();

const describeCourse = async (req, res) => {
    try {
        const { title, topics } = req.body;
        if (!title) throw new Error('Title is required');
        const result = await aiService.describeCourse(title, topics || '');
        res.status(200).json({ data: result });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const summarizeLesson = async (req, res) => {
    try {
        const { title, contentType } = req.body;
        if (!title) throw new Error('Title is required');
        const result = await aiService.summarizeLesson(title, contentType || 'video');
        res.status(200).json({ data: result });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const suggestCourses = async (req, res) => {
    try {
        const { completedCourseTitles, availableCourseTitles } = req.body;
        if (!availableCourseTitles?.length) throw new Error('Available courses required');
        const result = await aiService.suggestCourses(
            completedCourseTitles || [],
            availableCourseTitles
        );
        res.status(200).json({ data: result });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

module.exports = { describeCourse, summarizeLesson, suggestCourses };