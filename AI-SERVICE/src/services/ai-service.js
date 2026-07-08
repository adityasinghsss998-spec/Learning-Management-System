const { AiRepository } = require('../repository/ai-repo');

class AiService {
    constructor() {
        this.repo = new AiRepository();
    }

    async describeCourse(title, topics) {
        try {
            const prompt = `
You are an expert course copywriter for an online learning platform called Nexus.

Write a compelling course description for a course titled "${title}".
The course covers the following topics: ${topics}.

Requirements:
- 3 to 4 sentences maximum
- Written from the student's perspective — what they will learn and achieve
- Professional but approachable tone
- No markdown, no bullet points, plain text only
- Do not start with "In this course" or "This course will"
- End with what the student will be able to build or do after completing it

Return only the description, nothing else.
            `.trim();

            const text = await this.repo.generate(prompt);
            return { description: text.trim() };
        } catch (e) {
            console.log('Something went wrong at the service layer', e);
            throw e;
        }
    }

    async summarizeLesson(title, contentType) {
        try {
            const prompt = `
You are a helpful learning assistant on Nexus, an online learning platform.

A student is about to watch/read a lesson titled "${title}" which is a ${contentType} lesson.

Write a brief "what you'll learn" summary for this lesson.

Requirements:
- 2 to 3 short bullet points
- Each point starts with an action verb (Build, Understand, Learn, Create, Master, etc.)
- Plain text only, use a dash (-) for each bullet point
- No markdown headers, no extra text, just the bullet points

Return only the bullet points, nothing else.
            `.trim();

            const text = await this.repo.generate(prompt);
            return { summary: text.trim() };
        } catch (e) {
            console.log('Something went wrong at the service layer', e);
            throw e;
        }
    }

    async suggestCourses(completedCourseTitles, availableCourseTitles) {
        try {
            const prompt = `
You are a personalized learning advisor on Nexus, an online learning platform.

A student has completed these courses:
${completedCourseTitles.length > 0 ? completedCourseTitles.map(t => `- ${t}`).join('\n') : '- No courses completed yet'}

These courses are currently available on the platform:
${availableCourseTitles.map(t => `- ${t}`).join('\n')}

Suggest the top 3 courses the student should take next, in order of recommendation.

Requirements:
- Only suggest courses from the available list
- Base suggestions on logical learning progression
- Return a JSON array of exactly 3 course titles, exactly as they appear in the available list
- Return only the JSON array, no explanation, no markdown

Example format: ["Course Title 1", "Course Title 2", "Course Title 3"]
            `.trim();

            const text = await this.repo.generate(prompt);
            const clean = text.trim().replace(/```json|```/g, '').trim();
            const suggestions = JSON.parse(clean);
            return { suggestions };
        } catch (e) {
            console.log('Something went wrong at the service layer', e);
            throw e;
        }
    }
}

module.exports = { AiService };