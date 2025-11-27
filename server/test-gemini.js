const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log('❌ No GEMINI_API_KEY found in .env');
            return;
        }

        console.log(`🔑 API Key found: ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTry = ['gemini-1.5-flash', 'gemini-pro'];

        for (const modelName of modelsToTry) {
            console.log(`\nTesting model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                console.log(`✅ ${modelName} SUCCESS`);
                console.log(`Response: ${result.response.text()}`);
            } catch (e) {
                console.log(`❌ ${modelName} FAILED:`);
                console.log(e.message);
            }
        }

    } catch (error) {
        console.error('❌ Global Error:', error.message);
    }
}

listModels();
