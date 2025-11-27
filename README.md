# AI Image Studio 🎨

A comprehensive multi-model AI image generation platform that integrates multiple AI services including Google Gemini, OpenAI DALL-E, and OpenArt.ai.

## Features ✨

- **Multiple AI Models**: Choose from different AI image generation services
- **Text-to-Image Generation**: Create images from text descriptions
- **Image Enhancement**: Upload and enhance existing images
- **OpenArt.ai Integration**: Access artistic style generation (when API available)
- **Modern UI**: Beautiful, responsive interface built with React

## Available AI Models 🤖

### 1. Gemini Imagen 3.0
- **Endpoint**: `/api/generate`
- **Type**: Text-to-Image
- **Description**: High-quality image generation using Google's latest Imagen model

### 2. Gemini Vision + DALL-E 3
- **Endpoint**: `/api/generate-openai`
- **Type**: Image Enhancement
- **Description**: Analyze uploaded images with Gemini Vision and enhance with DALL-E 3
- **Requires**: Image upload for enhancement

### 3. OpenArt.ai Style
- **Endpoint**: `/api/generate/openart`
- **Type**: Artistic Style Generation
- **Description**: Generate images with artistic styles (API integration placeholder)
- **Note**: Currently provides alternatives and integration suggestions

## Setup Instructions 🚀

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- API Keys for AI services

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your API keys:
   ```env
   # Gemini AI API Key (Required for image analysis and generation)
   GEMINI_API_KEY=your_gemini_api_key_here

   # OpenAI API Key (Required for DALL-E 3 generation)
   OPENAI_API_KEY=your_openai_api_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints 📡

### GET /
Returns API information and available endpoints.

### GET /api/health
Health check endpoint showing configured services.

### POST /api/generate
Generate images using Gemini Imagen 3.0.

**Request Body**:
```json
{
  "prompt": "A beautiful sunset over mountains"
}
```

### POST /api/generate-openai
Generate enhanced images using Gemini Vision + DALL-E 3.

**Request Body**: FormData with `image` file and `prompt` field.

### POST /api/generate/openart
OpenArt.ai integration endpoint (placeholder).

**Request Body**:
```json
{
  "prompt": "Artistic landscape",
  "style": "oil_painting",
  "model": "stable_diffusion"
}
```

## Getting API Keys 🔑

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

## OpenArt.ai Integration 🎭

Currently, OpenArt.ai doesn't provide a public REST API. The integration endpoint provides:

- Information about alternative services
- Suggestions for compatible APIs
- Future API integration support

**Alternative Services**:
- Stability AI API
- Midjourney API alternatives
- Runway ML
- Replicate

## Usage Examples 💡

### Text-to-Image Generation
```javascript
// Using Gemini Imagen
fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "A serene lake at sunset with mountains in the background"
  })
});
```

### Image Enhancement
```javascript
// Using Gemini Vision + DALL-E
const formData = new FormData();
formData.append('image', imageFile);
formData.append('prompt', 'Enhance lighting and colors, make it more romantic');

fetch('/api/generate-openai', {
  method: 'POST',
  body: formData
});
```

## Project Structure 📁

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Styling
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── routes/
│   │   ├── generate.js           # Gemini Imagen route
│   │   └── generate-openai.js    # Gemini Vision + DALL-E route
│   ├── server.js         # Main server file
│   └── package.json
└── README.md
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

ISC License

## Support 💬

For issues or questions:
1. Check the API documentation
2. Review the error messages in the console
3. Ensure all required API keys are configured
4. Test with the health check endpoint

---

**Built with ❤️ using React, Node.js, Express, Google Gemini, and OpenAI**
