import React, { useEffect, useState, useRef } from 'react';
import './IntroSection.css';

const IntroSection = ({ scrollContainer }) => {
  const [typedText, setTypedText] = useState('');
  const [showPulse, setShowPulse] = useState(false);
  const subtitleText = 'Créateur 3D';
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTyping = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < subtitleText.length) {
          setTypedText(prev => prev + subtitleText[currentIndex]);
          currentIndex++;
          setTimeout(typeNextChar, 100);
        } else {
          setShowPulse(true);
        }
      };
      
      typeNextChar();
    }, 1000);

    return () => clearTimeout(startTyping);
  }, []);

  const scrollToNext = () => {
    if (scrollContainer.current) {
      const gallerySection = document.querySelector('.scene-3d-gallery');
      if (gallerySection) {
        gallerySection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <section className="scene scene-intro">
      <div className="intro-content">
        <h1 className="intro-title reveal-typo">Baptiste Michaud</h1>
        <div className="intro-subtitle">
          {typedText}
          {isTyping && !showPulse && <span className="typing-cursor">|</span>}
        </div>
        <button 
          className={`enter-btn ${showPulse ? 'pulse' : ''}`}
          onClick={scrollToNext}
        >
          Découvrir mes créations
        </button>
      </div>
      <div className="scroll-down-arrow" onClick={scrollToNext}>
        ↓
      </div>
    </section>
  );
};

export default IntroSection; 