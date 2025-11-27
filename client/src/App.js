import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [note, setNote] = useState('');

  // Dropdown options
  const [selectedOptions, setSelectedOptions] = useState({
    theme: '',
    lighting: ''
  });

  const themeCategories = [
    {
      value: 'classical_formal',
      label: 'Classical / Formal',
      description: 'Ballrooms, church aisles, elegant venues with refined décor',
      prompt: 'classic formal elegance, graceful ballroom staging, refined décor'
    },
    {
      value: 'garden_outdoor',
      label: 'Garden / Outdoor',
      description: 'Natural landscapes, pavilions, botanical settings',
      prompt: 'lush botanical garden atmosphere, soft greenery, open-air romance'
    },
    {
      value: 'beach_tropical',
      label: 'Beach / Tropical',
      description: 'Seaside locations, tropical gardens, coastal boardwalks',
      prompt: 'sun-kissed shoreline, gentle ocean breeze, tropical foliage accents'
    },
    {
      value: 'cultural_traditional',
      label: 'Cultural / Traditional',
      description: 'Temple settings, cultural venues, ceremonial décor',
      prompt: 'heritage-inspired backgrounds, ornate cultural motifs, ceremonial elegance'
    },
    {
      value: 'modern_contemporary',
      label: 'Modern / Contemporary',
      description: 'Minimalist interiors, urban rooftops, artistic spaces',
      prompt: 'sleek minimalist styling, architectural lines, editorial polish'
    }
  ];

  const lightingOptions = [
    {
      value: 'morning',
      label: 'Morning (Golden Hour)',
      description: 'Soft light with gentle warmth and sun flares',
      prompt: 'soft sunrise glow with golden highlights and subtle lens flares'
    },
    {
      value: 'afternoon',
      label: 'Afternoon (Neutral)',
      description: 'Bright, balanced daylight for crisp detail',
      prompt: 'bright neutral daylight with even exposure and true-to-life color'
    },
    {
      value: 'evening',
      label: 'Evening (Sunset)',
      description: 'Warm sunset hues with cinematic gradients',
      prompt: 'warm sunset palette, amber gradients, cinematic backlighting'
    },
    {
      value: 'night',
      label: 'Night (Ambient)',
      description: 'Moody night lighting with ambient glow or moonlight',
      prompt: 'romantic night ambience, soft ambient glow, moonlit highlights'
    }
  ];

  const uploadSectionRef = useRef(null);
  const howItWorksRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleOptionChange = (category, value) => {
    console.log(`Option changed: ${category} = ${value}`);
    setSelectedOptions(prev => {
      const newOptions = {
        ...prev,
        [category]: value
      };
      console.log('New selected options:', newOptions);
      return newOptions;
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !uploadedImage) {
      setError('Please upload an image first');
      return;
    }
    setCurrentStep(2);
    setError('');
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExplore = () => {
    scrollToSection(howItWorksRef);
  };

  const handleStartNow = () => {
    setCurrentStep(1);
    scrollToSection(uploadSectionRef);
  };

  const generatePrompt = () => {
    const themeInfo = themeCategories.find(option => option.value === selectedOptions.theme);
    const lightingInfo = lightingOptions.find(option => option.value === selectedOptions.lighting);

    console.log('GeneratePrompt called, selected options:', selectedOptions);
    console.log('Theme info:', themeInfo);
    console.log('Lighting info:', lightingInfo);

    if (!themeInfo || !lightingInfo) {
      return '';
    }

    const prompt = `🎨 AI WEDDING PHOTO ENHANCEMENT PROMPT:

Theme focus: ${themeInfo.label} (${themeInfo.description}).
Lighting direction: ${lightingInfo.label} (${lightingInfo.description}).
Creative direction cues: ${themeInfo.prompt}.
Lighting cues: ${lightingInfo.prompt}.

Enhance this wedding photo so it feels cohesive with the selected theme and lighting mood while preserving natural emotions and details.

✨ Refine lighting/exposure to match the chosen daypart
🎨 Harmonize colors to complement the theme palette
📸 Polish composition while keeping authentic poses
🌟 Deliver a magazine-worthy, story-rich final image`;

    console.log('Generated prompt:', prompt);
    return prompt;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleGenerate = async () => {
    console.log('HandleGenerate called, current selectedOptions:', selectedOptions);

    if (!uploadedImage) {
      setError('Please upload an image before enhancing.');
      return;
    }

    if (!selectedOptions.theme || !selectedOptions.lighting) {
      console.log('Theme or lighting missing');
      setError('Please select both a theme and a lighting mood');
      return;
    }

    const prompt = generatePrompt();

    if (!prompt) {
      setError('Prompt generation failed. Please adjust your selections.');
      return;
    }

    console.log('Starting generation process...');
    setLoading(true);
    setError('');
    setGeneratedImage('');
    setAnalysis('');
    setNote('');

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('prompt', prompt);

      const response = await fetch(`${API_BASE_URL}/api/generate-openai`, {
        method: 'POST',
        body: formData
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse API response:', jsonError);
      }

      if (!response.ok || !data) {
        const message = data?.message || 'Failed to enhance photo. Please try again.';
        throw new Error(message);
      }

      if (!data.success) {
        throw new Error(data.message || 'Enhancement request was not successful.');
      }

      setGeneratedImage(data.imageUrl);
      setAnalysis(data.description || data.enhancementPrompt || 'Enhancement details unavailable.');
      setNote(data.note || data.message || 'Your wedding photo was enhanced successfully.');
      setCurrentStep(3);
      console.log('Generation completed successfully');

    } catch (err) {
      console.error('Error during enhancement:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      console.log('Generation process finished');
    }
  };

  const resetApp = () => {
    setCurrentStep(1);
    setUploadedImage(null);
    setImagePreview('');
    setGeneratedImage('');
    setAnalysis('');
    setNote('');
    setSelectedOptions({
      theme: '',
      lighting: ''
    });
    setError('');
  };

  // Monitor state changes for debugging
  useEffect(() => {
    console.log('State updated:', {
      currentStep,
      uploadedImage: !!uploadedImage,
      imagePreview: !!imagePreview,
      loading,
      error,
      generatedImage: !!generatedImage,
      analysis: !!analysis,
      selectedOptions
    });
  }, [currentStep, uploadedImage, imagePreview, loading, error, generatedImage, analysis, selectedOptions]);

  const selectedCount = Object.values(selectedOptions).filter(value => value !== '').length;

  return (
    <div className="App">
      {/* Animated Background */}
      <div className="bg-gradient"></div>
      
      {/* Header with modern design */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">AI</div>
            <div className="logo-text">
              <h1>Wedding AI Studio</h1>
              <p className="tagline">Transform memories into masterpieces</p>
            </div>
          </div>
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Upload</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Customize</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Results</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Intro */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">AI Wedding Enhancer</span>
            <h1>Create magazine-worthy wedding memories in minutes</h1>
            <p>
              Upload your favorite wedding photo, describe the vibe you want, and let our dual AI
              pipeline (Gemini + DALL·E) elevate lighting, color, and storytelling automatically.
            </p>
            <div className="hero-actions">
              <button className="btn btn-secondary" onClick={handleExplore}>
                How it works
              </button>
              <button className="btn btn-primary" onClick={handleStartNow}>
                Start now
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            <ul className="hero-highlights">
              <li>HD outputs</li>
              <li>Secure uploads</li>
              <li>Custom styling</li>
            </ul>
          </div>
          <div className="hero-card">
            <h3>Why couples love it</h3>
            <ul>
              <li>Guided prompts ensure every edit matches your story</li>
              <li>Professional retouching without hiring a studio</li>
              <li>Preview enhancements before downloading</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="how-it-works" ref={howItWorksRef}>
        <h2>Everything happens in three friendly steps</h2>
        <div className="how-grid">
          {[
            {
              title: '1 · Upload',
              text: 'Pick any JPG, PNG, or WEBP up to 10MB. We keep files private and process securely.'
            },
            {
              title: '2 · Customize',
              text: 'Choose a storytelling theme and lighting mood to craft a precise AI prompt.'
            },
            {
              title: '3 · Enhance',
              text: 'Our Gemini + DALL·E workflow analyzes your photo and returns a polished masterpiece.'
            }
          ].map((item) => (
            <article className="how-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-strip">
        {[
          { title: 'Lighting intelligence', text: 'Automatic exposure, contrast, and glow tuning for dreamy scenes.' },
          { title: 'Mood styling', text: 'Apply romantic, cinematic, or editorial themes with one click.' },
          { title: 'Story-safe processing', text: 'No public sharing—your photos stay between you and the AI.' }
        ].map((feature) => (
          <div className="feature-card" key={feature.title}>
            <h4>{feature.title}</h4>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentStep === 1 && (
          <div className="upload-section fade-in" ref={uploadSectionRef} id="upload-section">
            <div className="section-header">
              <h2>Upload Your Wedding Photo</h2>
              <p>Choose a beautiful moment to enhance</p>
            </div>

            <div className="upload-area">
              {!imagePreview ? (
                <label htmlFor="image-upload" className="upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    className="upload-input"
                  />
                  <div className="upload-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3>Drop your photo here</h3>
                  <p>or click to browse</p>
                  <span className="upload-hint">Supports: JPG, PNG, WEBP</span>
                </label>
              ) : (
                <div className="preview-container">
                  <div className="preview-card">
                    <img src={imagePreview} alt="Wedding preview" />
                    <div className="preview-overlay">
                      <label htmlFor="image-upload" className="change-photo-btn">
                        Change Photo
                      </label>
                    </div>
                  </div>
                  <div className="preview-info">
                    <svg className="check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Photo uploaded successfully</span>
                  </div>
                </div>
              )}
            </div>

            <div className="action-bar">
              <button
                className="btn btn-primary btn-large"
                onClick={handleNext}
                disabled={!uploadedImage}
              >
                Continue to Customization
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="customization-section fade-in">
            <div className="section-header">
              <button className="back-btn" onClick={handleBack}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h2>Customize Your Enhancement</h2>
                <p>Select options to create your perfect wedding photo</p>
              </div>
            </div>

            <div className="customization-grid two-inputs">
              <div className="custom-select-wrapper">
                <label className="select-label">Theme Selection</label>
                <div className="select-container">
                  <select
                    value={selectedOptions.theme}
                    onChange={(e) => handleOptionChange('theme', e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Choose a theme atmosphere</option>
                    {themeCategories.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="custom-select-wrapper">
                <label className="select-label">Lighting Selection</label>
                <div className="select-container">
                  <select
                    value={selectedOptions.lighting}
                    onChange={(e) => handleOptionChange('lighting', e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Choose a lighting mood</option>
                    {lightingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="selection-details">
              <div className="detail-card">
                <h4>Theme categories</h4>
                <ul>
                  {themeCategories.map(option => (
                    <li key={option.value}>
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="detail-card">
                <h4>Lighting moods</h4>
                <ul>
                  {lightingOptions.map(option => (
                    <li key={option.value}>
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="prompt-preview-card">
              <div className="prompt-header">
                <h3>AI Prompt Preview</h3>
                <div className="selection-badge">
                  {selectedCount} / 2 selected
                </div>
              </div>
              <div className="prompt-content">
                {generatePrompt() || (
                  <div className="prompt-placeholder">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Select customization options above to preview your AI enhancement prompt</p>
                  </div>
                )}
              </div>
            </div>

            <div className="action-bar">
              <button className="btn btn-secondary" onClick={resetApp}>
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Over
              </button>
              <button
                className="btn btn-primary btn-large"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Enhanced Photo
                    <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && generatedImage && (
          <div className="result-section fade-in">
            <div className="success-banner">
              <div className="success-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2>Enhancement Complete!</h2>
                <p>{note}</p>
              </div>
            </div>

            <div className="comparison-container">
              <div className="comparison-card">
                <div className="image-box">
                  <div className="image-label">Original</div>
                  <img src={imagePreview} alt="Original wedding" />
                </div>
                <div className="comparison-divider">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="image-box">
                  <div className="image-label enhanced">Enhanced</div>
                  <img src={generatedImage} alt="AI enhanced wedding" />
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h3>Enhancement Summary</h3>
              <div className="analysis-content">{analysis}</div>
            </div>

            <div className="action-bar">
              <button className="btn btn-secondary" onClick={resetApp}>
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Enhance Another Photo
              </button>
              <a
                href={generatedImage}
                download="enhanced-wedding-photo.jpg"
                className="btn btn-primary"
              >
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Enhanced Photo
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
