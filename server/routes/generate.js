const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate image using Gemini's Imagen model
router.post('/', async (req, res) => {
  try {
    if (!req.body.prompt) {
      return res.status(400).json({
        success: false,
        message: 'No prompt provided'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured. Please check your .env file.'
      });
    }

    console.log('🎨 Processing text-to-image request...');
    console.log(`📝 User prompt: ${req.body.prompt}`);

    // Initialize the Gemini Imagen model
    const model = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-002'
    });

    // Generate image using Imagen
    const result = await model.generateContent({
      prompt: req.body.prompt,
      generationConfig: {
        aspectRatio: '1:1',
        personGeneration: 'allow_adult'
      }
    });

    const response = await result.response;
    const imageData = response.image;

    if (imageData && imageData.data) {
      // Convert the image data to base64
      const base64Image = imageData.data;

      console.log('✅ Image generation completed successfully');

      res.json({
        success: true,
        message: 'Image generated successfully!',
        imageUrl: `data:image/png;base64,${base64Image}`,
        prompt: req.body.prompt,
        model: 'imagen-3.0-generate-002',
        timestamp: new Date().toISOString(),
        note: 'Image generated using Google Gemini Imagen 3.0'
      });
    } else {
      throw new Error('No image data received from API');
    }

  } catch (error) {
    console.error('❌ Error generating image:', error);
    console.error('Error stack:', error.stack);

    // Handle specific API errors
    if (error.message && error.message.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'Invalid or missing API key. Please check your configuration.',
        error: error.message
      });
    }

    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'API quota exceeded. Please try again later.',
        error: error.message
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate image. Please try again.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check for the generate route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: 'imagen-3.0-generate-002',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;