import React, { useState } from 'react';
import './App.css';
import ProjectGallery from './components/ProjectGallery';

function App() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Préfixe commun pour toutes les images afin de gérer correctement le chemin
  // que ce soit en développement (localhost) ou en production (GitHub Pages).
  const IMAGE_BASE_PATH = `${(process.env.PUBLIC_URL || '').replace(/\/$/, '')}/images/projects/architectural-modeling/`;

  // Images du projet de modélisation architecturale
  const architecturalImages = [
    '03.png',
    '04.png',
    '05.png',
    '06.png',
    '07.png',
    '08.png',
    '09.png',
    '10.png',
    '11.png',
    '12.png',
    '13.png',
    '14.png',
    '15.png'
  ].map((file) => `${IMAGE_BASE_PATH}${file}`);

  const scrollToGallery = () => {
    const gallerySection = document.querySelector('.scene-3d-gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const openProjectGallery = () => {
    setIsGalleryOpen(true);
  };

  const closeProjectGallery = () => {
    setIsGalleryOpen(false);
  };

  return (
    <div className="App">
      
      <div className="scroll-container">
        {/* Section Intro */}
        <section className="scene scene-intro">
          <div className="intro-content">
            <h1 className="intro-title">Baptiste Michaud</h1>
            <div className="intro-subtitle">
              Créateur 3D
            </div>
            <button className="enter-btn" onClick={scrollToGallery}>
              Découvrir mes créations
            </button>
          </div>
          <div className="scroll-down-arrow" onClick={scrollToGallery}>
            ↓
          </div>
        </section>

        {/* Section Galerie 3D */}
        <section className="scene scene-3d-gallery">
          <div className="gallery-content">
            <h2>Créations 3D</h2>
            <p>Découvrez mes projets 3D, de la modélisation à l'animation</p>
            
            <div className="projects-grid">
              <div className="project-3d-card clickable" onClick={openProjectGallery}>
                <div className="project-3d-preview">
                  <img 
                    src={`${IMAGE_BASE_PATH}preview.png`} 
                    alt="Aperçu modélisation architecturale"
                    className="preview-image"
                  />
                  <div className="preview-overlay">
                    <span>Voir la galerie complète</span>
                  </div>
                </div>
                <div className="project-3d-info">
                  <h3>Modélisation Architecturale</h3>
                  <p>Rendu 3D photoréaliste réalisé à la demande d'un client souhaitant présenter son projet immobilier de manière plus professionnelle et légitime lors de sa présentation auprès de sa banque pour obtenir un financement.</p>
                  <div className="project-tags">
                    <span className="tag">Blender</span>
                  </div>
                </div>
              </div>

              <div className="project-3d-card">
                <div className="project-3d-preview">
                  <div className="preview-placeholder">
                    <span>Bientôt disponible</span>
                  </div>
                </div>
                <div className="project-3d-info">
                  <h3>Projet à venir</h3>
                  <p>Nouveau projet en cours de développement. Plus d'informations bientôt.</p>
                  <div className="project-tags">
                    <span className="tag">Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="project-3d-card">
                <div className="project-3d-preview">
                  <div className="preview-placeholder">
                    <span>Bientôt disponible</span>
                  </div>
                </div>
                <div className="project-3d-info">
                  <h3>Projet à venir</h3>
                  <p>Nouveau projet en cours de développement. Plus d'informations bientôt.</p>
                  <div className="project-tags">
                    <span className="tag">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="scene scene-contact">
          <div className="contact-content">
            <h2>Collaborons</h2>
            <p>
              Prêt à donner vie à vos idées en 3D ?<br />
              Contactez-moi pour discuter de votre projet.
            </p>
            <div className="contact-links">
              <a href="mailto:baptiste-michaud@outlook.com" className="contact-btn">
                Email
              </a>
              <a href="https://www.linkedin.com/in/baptiste-michaud-865283247/" className="contact-btn" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>

      <ProjectGallery 
        isOpen={isGalleryOpen}
        onClose={closeProjectGallery}
        projectImages={architecturalImages}
        projectTitle="Modélisation Architecturale"
      />
    </div>
  );
}

export default App; 