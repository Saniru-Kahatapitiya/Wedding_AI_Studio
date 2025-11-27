const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Generate enhanced image using Gemini Vision + OpenAI DALL-E
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.'
      });
    }

    console.log('🎨 Processing image enhancement request...');
    console.log(`📝 User prompt: ${req.body.prompt}`);
    console.log(`🖼️ Image size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📋 Image type: ${req.file.mimetype}`);

    // Step 1: Analyze the uploaded image with Gemini Vision
    console.log('🔍 Analyzing image with Gemini Vision...');
    let analysisText = '';

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const analysisPrompt = `Analyze this wedding photo and provide a brief but detailed description. Include:
- The scene and setting
- People and their poses
- Lighting and mood
- Colors and composition
Keep it concise (2-3 sentences) but descriptive enough for image generation.`;

      const result = await model.generateContent([
        analysisPrompt,
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString('base64')
          }
        }
      ]);

      analysisText = result.response.text();
      console.log('✅ Image analysis completed');
      console.log(`📄 Analysis: ${analysisText.substring(0, 150)}...`);

    } catch (geminiError) {
      console.error('⚠️ Gemini Vision analysis failed, proceeding with user prompt only.');
      console.error('Gemini Error:', geminiError.message);
      analysisText = 'Image analysis unavailable. Using user provided theme and lighting preferences.';
    }

    // Step 2: Generate enhanced image with OpenAI DALL-E
    console.log('🎨 Generating enhanced image with DALL-E 3...');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Create a comprehensive prompt combining analysis and user preferences
    const enhancementPrompt = `Professional wedding photography: ${analysisText}

User requested enhancements: ${req.body.prompt}

Style: High-quality professional wedding photography, beautiful lighting, romantic atmosphere, elegant composition, natural colors, emotional and memorable moment.`;

    console.log(`📝 Enhancement prompt: ${enhancementPrompt.substring(0, 200)}...`);

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancementPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });

    const generatedImageUrl = imageResponse.data[0].url;
    const revisedPrompt = imageResponse.data[0].revised_prompt;

    console.log('✅ Image generation completed successfully');
    console.log(`🔗 Generated image URL: ${generatedImageUrl.substring(0, 50)}...`);

    res.json({
      success: true,
      message: 'Image enhancement completed successfully!',
      imageUrl: generatedImageUrl,
      description: analysisText,
      enhancementPrompt: enhancementPrompt,
      revisedPrompt: revisedPrompt,
      originalSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      processingTime: new Date().toISOString(),
      note: 'Image generated using OpenAI DALL-E 3'
    });

  } catch (error) {
    console.error('❌ Error processing image:', error);
    console.error('Error stack:', error.stack);

    // Handle specific API errors
    if (error.message && (error.message.includes('API_KEY') || error.message.includes('API key'))) {
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

    if (error.message && error.message.includes('billing')) {
      return res.status(402).json({
        success: false,
        message: 'Billing issue with API. Please check your account.',
        error: error.message
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process image. Please try again.',
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
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
