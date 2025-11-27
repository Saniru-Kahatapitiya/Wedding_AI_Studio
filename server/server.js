const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Routes
const generateRoutes = require('./routes/generate');
const generateOpenAIRoutes = require('./routes/generate-openai');

// Image generation routes
app.use('/api/generate', generateRoutes); // Gemini Imagen
app.use('/api/generate-openai', generateOpenAIRoutes); // Gemini Vision + DALL-E

// OpenArt.ai integration route (placeholder for future API integration)
app.post('/api/generate/openart', async (req, res) => {
  try {
    const { prompt, style, model } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'No prompt provided'
      });
    }

    // Since OpenArt.ai doesn't have a direct API, we'll provide a structured response
    // that could be used to interact with their platform or similar services
    console.log('🎨 OpenArt.ai style generation request...');
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🎭 Style: ${style || 'default'}`);
    console.log(`🤖 Model: ${model || 'auto'}`);

    // This is a placeholder response - in a real implementation, you would:
    // 1. Use OpenArt.ai API if available
    // 2. Or redirect to their web interface
    // 3. Or use a compatible service

    res.json({
      success: true,
      message: 'OpenArt.ai integration placeholder',
      note: 'OpenArt.ai integration would require their API access or web automation',
      suggestion: 'Consider using OpenArt.ai through their web interface or integrating with compatible APIs like Stability AI, Midjourney API, or similar services',
      alternatives: [
        'Stability AI API (stable-diffusion)',
        'Midjourney API alternatives',
        'DALL-E 3 (already implemented)',
        'Imagen 3.0 (already implemented)'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error with OpenArt.ai integration:', error);
    res.status(500).json({
      success: false,
      message: 'OpenArt.ai integration not available',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Image Studio API',
    endpoints: {
      'POST /api/generate': 'Generate images using Gemini Imagen 3.0',
      'POST /api/generate-openai': 'Generate enhanced images using Gemini Vision + DALL-E 3',
      'POST /api/generate/openart': 'OpenArt.ai integration (placeholder)'
    },
    availableModels: [
      'imagen-3.0-generate-002',
      'dall-e-3',
      'gemini-1.5-flash (vision)'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    availableEndpoints: [
      '/api/generate',
      '/api/generate-openai',
      '/api/generate/openart'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }

  console.error('Error:', error);
  res.status(500).json({
    message: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎨 AI Image Studio server is running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/generate - Gemini Imagen`);
  console.log(`   POST /api/generate-openai - Gemini Vision + DALL-E`);
  console.log(`   POST /api/generate/openart - OpenArt.ai integration`);
});
