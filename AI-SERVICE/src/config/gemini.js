const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the strict base model name recognized by the current API
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

module.exports = { model };