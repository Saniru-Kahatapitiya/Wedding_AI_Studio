import React, { useState, useRef } from 'react';
import './PhotoBlend.css';
import html2canvas from 'html2canvas';

function PhotoBlend({ onBack }) {
    const [blendImages, setBlendImages] = useState([null, null, null, null]);
    const [blendPreviews, setBlendPreviews] = useState(['', '', '', '']);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showEnlarged, setShowEnlarged] = useState(false);
    const enlargedRef = useRef(null);

    const templates = [
        {
            id: 1,
            name: 'Classic Grid',
            description: '2x2 grid layout with equal spacing',
            layout: 'grid'
        },
        {
            id: 2,
            name: 'Collage Style',
            description: 'Artistic overlapping arrangement',
            layout: 'collage'
        },
        {
            id: 3,
            name: 'Story Timeline',
            description: 'Horizontal timeline with captions',
            layout: 'timeline'
        },
        {
            id: 4,
            name: 'Spotlight Focus',
            description: 'One large photo with three thumbnails',
            layout: 'spotlight'
        },
        {
            id: 5,
            name: 'Magazine Layout',
            description: 'Editorial style with asymmetric grid',
            layout: 'magazine'
        },
        {
            id: 6,
            name: 'Polaroid Stack',
            description: 'Overlapping polaroid-style frames',
            layout: 'polaroid'
        }
    ];

    const handleImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...blendImages];
            newImages[index] = file;
            setBlendImages(newImages);

            const reader = new FileReader();
            reader.onload = (e) => {
                const newPreviews = [...blendPreviews];
                newPreviews[index] = e.target.result;
                setBlendPreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const allImagesUploaded = blendImages.every(img => img !== null);

    const [downloading, setDownloading] = useState(false);

    const handleViewEnlarged = () => {
        setShowEnlarged(true);
    };

    const handleDownload = async () => {
        if (!enlargedRef.current) {
            alert('Preview not ready. Please try again.');
            return;
        }

        setDownloading(true);

        try {
            // Wait a moment to ensure all images are fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the template with high quality settings
            const canvas = await html2canvas(enlargedRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0,
                removeContainer: false,
                foreignObjectRendering: false
            });

            // Convert to blob for better quality
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Failed to create image blob');
                }

                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const templateName = templates.find(t => t.id === selectedTemplate)?.name || 'template';
                link.download = `wedding-blend-${templateName.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = url;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 100);

                setDownloading(false);

                // Success message
                console.log('✅ Download completed successfully!');
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('❌ Download failed:', error);
            setDownloading(false);

            // Detailed error message
            let errorMessage = 'Download failed. ';
            if (error.message.includes('tainted')) {
                errorMessage += 'Image security issue. Please use local images.';
            } else if (error.message.includes('timeout')) {
                errorMessage += 'Images took too long to load. Please try again.';
            } else {
                errorMessage += 'Please ensure all images are loaded and try again.';
            }

            alert(errorMessage);
        }
    };

    const renderTemplatePreview = (template, isEnlarged = false) => {
        return (
            <div className={`preview-layout ${template.layout} ${isEnlarged ? 'enlarged' : ''}`}>
                {blendPreviews.map((preview, idx) => (
                    <div key={idx} className={`preview-image img-${idx + 1}`}>
                        {preview ? (
                            <img src={preview} alt={`Wedding photo ${idx + 1}`} />
                        ) : (
                            <div className="placeholder">{idx + 1}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

    return (
        <div className="photo-blend-container">
            <div className="blend-header">
                <button className="back-btn" onClick={onBack}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div>
                    <h2>Photo Blend Studio</h2>
                    <p>Upload 4 photos and visualize them in different templates</p>
                </div>
            </div>

            <div className="upload-grid">
                {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="upload-slot">
                        <label htmlFor={`blend-upload-${index}`} className="upload-label">
                            {blendPreviews[index] ? (
                                <div className="uploaded-preview">
                                    <img src={blendPreviews[index]} alt={`Upload ${index + 1}`} />
                                    <div className="change-overlay">
                                        <span>Change Photo</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-slot">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Photo {index + 1}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                id={`blend-upload-${index}`}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="file-input"
                            />
                        </label>
                    </div>
                ))}
            </div>

            {allImagesUploaded && (
                <div className="templates-section fade-in">
                    <h3>Choose Your Template</h3>
                    <div className="templates-grid">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className={`template-preview ${selectedTemplate === template.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                {renderTemplatePreview(template, false)}
                                <div className="template-info">
                                    <h4>{template.name}</h4>
                                    <p>{template.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedTemplate && (
                        <div className="action-bar">
                            <button className="btn btn-primary btn-large" onClick={handleViewEnlarged}>
                                View Enlarged Preview
                                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Enlarged Preview Modal */}
            {showEnlarged && selectedTemplateData && (
                <div className="enlarged-modal" onClick={() => setShowEnlarged(false)}>
                    <div className="enlarged-content" onClick={(e) => e.stopPropagation()}>
                        <div className="enlarged-header">
                            <h3>{selectedTemplateData.name}</h3>
                            <button className="close-btn" onClick={() => setShowEnlarged(false)}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="enlarged-preview-wrapper" ref={enlargedRef}>
                            {renderTemplatePreview(selectedTemplateData, true)}
                        </div>

                        <div className="enlarged-actions">
                            <button className="btn btn-secondary" onClick={() => setShowEnlarged(false)} disabled={downloading}>
                                Close
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoBlend;
