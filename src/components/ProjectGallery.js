import React, { useState, useEffect, useRef } from 'react';
import './ProjectGallery.css';
import Model3DViewer from './Model3DViewer';

const ProjectGallery = ({ isOpen, onClose, projectImages, projectTitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const thumbnailsRef = useRef();

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft') {
        previousImage();
      }
      if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentImageIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === projectImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? projectImages.length - 1 : prev - 1
    );
  };

  const scrollToActiveThumbnail = () => {
    if (thumbnailsRef.current) {
      const activeThumbnail = thumbnailsRef.current.children[currentImageIndex];
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  // Centrer la vignette active quand l'image change
  useEffect(() => {
    if (isOpen) {
      scrollToActiveThumbnail();
    }
  }, [currentImageIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="project-gallery-overlay" onClick={onClose}>
      <div className="project-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="gallery-header">
          <h3>{projectTitle}</h3>
          <span className="image-counter">
            {currentImageIndex + 1} / {projectImages.length}
          </span>
        </div>

        <div className="gallery-main">
          <div className="gallery-thumbnails" ref={thumbnailsRef}>
            {projectImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>

          <div className="gallery-image-container">
            <button 
              className="gallery-nav-btn gallery-prev" 
              onClick={previousImage}
              disabled={projectImages.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <img 
              src={projectImages[currentImageIndex]} 
              alt={`${projectTitle} ${currentImageIndex + 1}`}
              className="gallery-main-image"
            />

            <button 
              className="gallery-nav-btn gallery-next" 
              onClick={nextImage}
              disabled={projectImages.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="gallery-description">
          <p>Rendu 3D photoréaliste réalisé à la demande d'un client souhaitant présenter son projet immobilier de manière plus professionnelle et légitime lors de sa présentation auprès de sa banque pour obtenir un financement.</p>
          
          <div className="gallery-3d-section">
            <button 
              className="view-3d-btn"
              onClick={() => setIs3DViewerOpen(true)}
            >
              <span className="btn-icon">🎯</span>
              Voir en 3D Interactif
            </button>
          </div>
        </div>
      </div>
      
      <Model3DViewer 
        isOpen={is3DViewerOpen}
        onClose={() => setIs3DViewerOpen(false)}
      />
    </div>
  );
};

export default ProjectGallery; 