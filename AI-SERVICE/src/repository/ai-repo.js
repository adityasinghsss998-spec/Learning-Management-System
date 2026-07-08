const { model } = require('../config/gemini');

class AiRepository {
    async generate(prompt) {
        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (e) {
            console.log('Something went wrong at the repo layer', e);
            throw e;
        }
    }
}

module.exports = { AiRepository };