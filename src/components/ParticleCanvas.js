import React, { useEffect, useRef, useState } from 'react';
import './ParticleCanvas.css';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [currentSection, setCurrentSection] = useState('intro');
  const [isInView, setIsInView] = useState(true);
  const [reduceAnimations, setReduceAnimations] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = 0;
    const fps = 60;
    const fpsInterval = 1000 / fps;

    // Fonction de redimensionnement
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialiser les particules
    const initParticles = () => {
      particlesRef.current = [];
      const isMobile = window.innerWidth < 768;
      const particleCount = currentSection === 'gallery-3d' 
        ? (isMobile ? 8 : 12) 
        : (isMobile ? 15 : 20);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * (reduceAnimations ? 0.1 : 0.3),
          vy: (Math.random() - 0.5) * (reduceAnimations ? 0.1 : 0.3),
          size: Math.random() * (reduceAnimations ? 1 : 1.5) + 0.5,
          opacity: Math.random() * (reduceAnimations ? 0.2 : 0.3) + 0.1,
          hue: Math.random() * 60 + 200
        });
      }
    };

    // Ajuster les particules selon la section
    const adjustParticlesForSection = () => {
      const isMobile = window.innerWidth < 768;
      
      if (currentSection === 'gallery-3d') {
        const targetCount = isMobile ? 8 : 12;
        
        if (particlesRef.current.length > targetCount) {
          particlesRef.current = particlesRef.current.slice(0, targetCount);
        }
        
        particlesRef.current.forEach(particle => {
          particle.vx *= 0.5;
          particle.vy *= 0.5;
          particle.opacity *= 0.7;
        });
      } else if (currentSection === 'intro') {
        const targetCount = isMobile ? 15 : 20;
        
        if (particlesRef.current.length < targetCount) {
          initParticles();
        }
      }
    };

    // Animation des particules
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const elapsed = currentTime - lastTime;

      const targetFPS = currentSection === 'gallery-3d' ? 30 : 60;
      const currentFpsInterval = 1000 / targetFPS;

      if (elapsed > currentFpsInterval) {
        lastTime = currentTime - (elapsed % currentFpsInterval);

        const fadeAlpha = currentSection === 'gallery-3d' ? 0.15 : 0.1;
        ctx.fillStyle = `rgba(9, 9, 9, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle, index) => {
          // Mouvement
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Rebond sur les bords
          if (particle.x < 0 || particle.x > window.innerWidth) {
            particle.vx *= -1;
          }
          if (particle.y < 0 || particle.y > window.innerHeight) {
            particle.vy *= -1;
          }

          // Maintenir dans les limites
          particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
          particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));

          // Rendu de la particule
          ctx.save();
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Connexions ultra-réduites dans la section 3D
          if (!reduceAnimations && index % 4 === 0) {
            for (let i = index + 1; i < particlesRef.current.length; i++) {
              const otherParticle = particlesRef.current[i];
              const dx = particle.x - otherParticle.x;
              const dy = particle.y - otherParticle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 60) {
                ctx.save();
                ctx.globalAlpha = (60 - distance) / 60 * 0.03;
                ctx.strokeStyle = `hsl(${particle.hue}, 70%, 60%)`;
                ctx.lineWidth = 0.2;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.stroke();
                ctx.restore();
                break;
              }
            }
          }
        });
      }

      if (isInView) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Initialisation
    resizeCanvas();
    initParticles();
    ctx.fillStyle = '#090909';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isInView) {
      animate();
    }

    // Gestionnaire de redimensionnement
    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentSection, reduceAnimations, isInView]);

  // Détection de la section visible
  useEffect(() => {
    const sections = document.querySelectorAll('.scene');
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          if (section.classList.contains('scene-intro')) {
            setCurrentSection('intro');
            setReduceAnimations(false);
          } else if (section.classList.contains('scene-3d-gallery')) {
            setCurrentSection('gallery-3d');
            setReduceAnimations(true);
          } else if (section.classList.contains('scene-contact')) {
            setCurrentSection('contact');
            setReduceAnimations(false);
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

  // Gestion de la visibilité
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsInView(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        setIsInView(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Pause pendant le scroll rapide dans la section 3D
  useEffect(() => {
    let scrollPauseTimeout;
    
    const handleScroll = () => {
      if (currentSection === 'gallery-3d') {
        setIsInView(false);
        clearTimeout(scrollPauseTimeout);
        
        scrollPauseTimeout = setTimeout(() => {
          setIsInView(true);
        }, 100);
      }
    };

    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollPauseTimeout);
    };
  }, [currentSection]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

export default ParticleCanvas; 