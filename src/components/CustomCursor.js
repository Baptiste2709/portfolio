import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('intro');
  const [isHovering, setIsHovering] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);
  const lastCheckTime = useRef(0);

  useEffect(() => {
    // Ne pas afficher le curseur personnalisé sur mobile
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    if (isMobile) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Throttling pour le mouvement
    const handleMouseMove = (e) => {
      const now = Date.now();
      
      // Throttling plus agressif dans la section 3D
      const throttleDelay = currentSection === 'gallery-3d' ? 16 : 8; // 60fps -> 30fps dans 3D
      
      if (now - lastMoveTime.current < throttleDelay) return;
      lastMoveTime.current = now;
      
      positionRef.current.x = e.clientX - 12;
      positionRef.current.y = e.clientY - 12;
      
      cursor.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    // Détection des éléments interactifs avec throttling
    const handleMouseOver = (e) => {
      const now = Date.now();
      
      // Throttling encore plus agressif pour la détection hover
      const hoverThrottleDelay = currentSection === 'gallery-3d' ? 100 : 50;
      
      if (now - lastCheckTime.current < hoverThrottleDelay) return;
      lastCheckTime.current = now;
      
      // Détection simplifiée dans la section 3D
      let isInteractive = false;
      
      if (currentSection === 'gallery-3d') {
        // Détection ultra-simplifiée pour la section 3D
        const tagName = e.target.tagName.toLowerCase();
        const className = e.target.className || '';
        
        isInteractive = tagName === 'button' || 
                       tagName === 'a' || 
                       className.includes('contact-btn') ||
                       className.includes('enter-btn') ||
                       className.includes('tag');
        
        // Éviter la détection sur les cartes de projets dans la section 3D
        if (className.includes('project-3d-card') || 
            className.includes('preview-placeholder') ||
            e.target.closest('.project-3d-card')) {
          isInteractive = false;
        }
      } else {
        // Détection normale pour les autres sections
        isInteractive = e.target.matches('button, a, .contact-btn, .enter-btn, .scroll-down-arrow, .project-3d-card, .tag, [role="button"]') ||
                       e.target.closest('button, a, .contact-btn, .enter-btn, .scroll-down-arrow, .project-3d-card, .tag');
      }
      
      setIsHovering(!!isInteractive);
    };

    // Gestion de l'entrée/sortie de la souris
    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
    };

    // Événements avec options passives pour les performances
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentSection]); // Ajouter currentSection comme dépendance

  // Détection de la section visible
  useEffect(() => {
    const sections = document.querySelectorAll('.scene');
    if (sections.length === 0) return;
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          if (section.classList.contains('scene-intro')) {
            setCurrentSection('intro');
          } else if (section.classList.contains('scene-3d-gallery')) {
            setCurrentSection('gallery-3d');
          } else if (section.classList.contains('scene-contact')) {
            setCurrentSection('contact');
          }
        }
      });
    }, {
      threshold: 0.5
    });

    sections.forEach(section => {
      sectionObserver.observe(section);
    });

    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className={`custom-cursor ${isVisible ? 'visible' : ''} ${currentSection} ${isHovering ? 'hovering' : ''}`}
    />
  );
};

export default CustomCursor; 