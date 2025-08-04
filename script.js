// Variables globales
let bgCanvas, bgCtx;
let particles = [];
let animationId;
let currentScene = 0;
let isScrolling = false;
let lastTime = 0;
let fps = 60;
let fpsInterval = 1000 / fps;
let isInView = true;
let currentSection = 'intro';
let reduceAnimations = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initCanvas();
    initCursor();
    initScrollEffects();
    initTypingEffect();
    initEnterButton();
    initParticles();
    initSectionDetection();
    animate();
});

// Detection de la section visible pour optimiser les performances
function initSectionDetection() {
    const sections = document.querySelectorAll('.scene');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                if (section.classList.contains('scene-intro')) {
                    currentSection = 'intro';
                    reduceAnimations = false;
                } else if (section.classList.contains('scene-3d-gallery')) {
                    currentSection = '3d-gallery';
                    reduceAnimations = true; // Réduire les animations dans la section 3D
                } else if (section.classList.contains('scene-contact')) {
                    currentSection = 'contact';
                    reduceAnimations = false;
                }
                
                // Ajuster les particules selon la section
                adjustParticlesForSection();
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Ajustement des particules selon la section
function adjustParticlesForSection() {
    const isMobile = window.innerWidth < 768;
    
    if (currentSection === '3d-gallery') {
        // Réduire drastiquement les particules dans la section 3D
        const targetCount = isMobile ? 8 : 12;
        
        if (particles.length > targetCount) {
            particles = particles.slice(0, targetCount);
        }
        
        // Ralentir les particules
        particles.forEach(particle => {
            particle.vx *= 0.5;
            particle.vy *= 0.5;
            particle.opacity *= 0.7;
        });
    } else if (currentSection === 'intro') {
        // Particules normales pour l'intro
        const targetCount = isMobile ? 15 : 20;
        
        if (particles.length < targetCount) {
            initParticles();
        }
    }
}

// Initialisation du canvas 3D
function initCanvas() {
    bgCanvas = document.getElementById('bg-canvas');
    bgCtx = bgCanvas.getContext('2d');
    
    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Effet de fond subtil
    bgCtx.fillStyle = '#090909';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

// Système de particules ultra-optimisé
function initParticles() {
    particles = []; // Vider d'abord
    
    const isMobile = window.innerWidth < 768;
    const particleCount = currentSection === '3d-gallery' 
        ? (isMobile ? 8 : 12) 
        : (isMobile ? 15 : 20);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * (reduceAnimations ? 0.1 : 0.3),
            vy: (Math.random() - 0.5) * (reduceAnimations ? 0.1 : 0.3),
            size: Math.random() * (reduceAnimations ? 1 : 1.5) + 0.5,
            opacity: Math.random() * (reduceAnimations ? 0.2 : 0.3) + 0.1,
            hue: Math.random() * 60 + 200
        });
    }
}

// Animation ultra-optimisée
function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const elapsed = currentTime - lastTime;
    
    // Réduire le FPS dans la section 3D
    const targetFPS = currentSection === '3d-gallery' ? 30 : 60;
    const currentFpsInterval = 1000 / targetFPS;
    
    if (elapsed > currentFpsInterval) {
        lastTime = currentTime - (elapsed % currentFpsInterval);
        
        // Effet de traînée adaptatif
        const fadeAlpha = currentSection === '3d-gallery' ? 0.15 : 0.1;
        bgCtx.fillStyle = `rgba(9, 9, 9, ${fadeAlpha})`;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Rendu des particules optimisé
        particles.forEach((particle, index) => {
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
            bgCtx.save();
            bgCtx.globalAlpha = particle.opacity;
            bgCtx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
            bgCtx.beginPath();
            bgCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            bgCtx.fill();
            bgCtx.restore();
            
            // Connexions ultra-réduites dans la section 3D
            if (!reduceAnimations && index % 4 === 0) {
                for (let i = index + 1; i < particles.length; i++) {
                    const otherParticle = particles[i];
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 60) {
                        bgCtx.save();
                        bgCtx.globalAlpha = (60 - distance) / 60 * 0.03;
                        bgCtx.strokeStyle = `hsl(${particle.hue}, 70%, 60%)`;
                        bgCtx.lineWidth = 0.2;
                        bgCtx.beginPath();
                        bgCtx.moveTo(particle.x, particle.y);
                        bgCtx.lineTo(otherParticle.x, otherParticle.y);
                        bgCtx.stroke();
                        bgCtx.restore();
                        break;
                    }
                }
            }
        });
    }
    
    if (isInView) {
        animationId = requestAnimationFrame(animate);
    }
}

// Curseur optimisé avec throttling
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let lastCursorUpdate = 0;
    
    function updateCursor(currentTime) {
        if (currentTime - lastCursorUpdate > 16) { // 60fps max
            const easing = currentSection === '3d-gallery' ? 0.05 : 0.1;
            cursorX += (mouseX - cursorX) * easing;
            cursorY += (mouseY - cursorY) * easing;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            lastCursorUpdate = currentTime;
        }
        
        requestAnimationFrame(updateCursor);
    }
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    updateCursor();
    
    // Effet au survol des éléments interactifs
    const interactiveElements = document.querySelectorAll('button, a, .project-3d-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.backgroundColor = 'rgba(245, 245, 245, 0.2)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.backgroundColor = 'transparent';
        });
    });
}

// Effets de défilement ultra-optimisés
function initScrollEffects() {
    const scrollContainer = document.getElementById('scroll-container');
    const revealElements = document.querySelectorAll('.reveal-typo');
    
    // Observer pour les animations de révélation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
    
    // Parallaxe désactivée dans la section 3D
    let scrollTimeout;
    scrollContainer.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            // Désactiver la parallaxe dans la section 3D
            if (currentSection === '3d-gallery') return;
            
            const scrollY = scrollContainer.scrollTop;
            const projectCards = document.querySelectorAll('.project-3d-card');
            
            projectCards.forEach((card, index) => {
                const speed = 0.005 * (index % 2 === 0 ? 1 : -1); // Effet très réduit
                card.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, 32); // Réduction de la fréquence
    });
}

// Effet de frappe optimisé
function initTypingEffect() {
    const subtitle = document.getElementById('intro-subtitle');
    const text = 'Créateur 3D';
    
    subtitle.textContent = '';
    subtitle.style.borderRight = '2px solid transparent';
    
    let i = 0;
    let isTyping = true;
    
    function typeCharacter() {
        if (i < text.length) {
            subtitle.textContent += text[i];
            i++;
            setTimeout(typeCharacter, 120);
        } else {
            isTyping = false;
            startCursorBlink();
        }
    }
    
    function startCursorBlink() {
        subtitle.style.borderRight = '2px solid #f5f5f5';
        
        setInterval(() => {
            if (!isTyping) {
                subtitle.style.borderRight = subtitle.style.borderRight === '2px solid transparent' 
                    ? '2px solid #f5f5f5' 
                    : '2px solid transparent';
            }
        }, 600);
    }
    
    setTimeout(typeCharacter, 1000);
}

// Bouton d'entrée
function initEnterButton() {
    const enterBtn = document.getElementById('enter-btn');
    
    enterBtn.addEventListener('click', () => {
        const gallerySection = document.querySelector('.scene-3d-gallery');
        gallerySection.scrollIntoView({ behavior: 'smooth' });
        
        enterBtn.style.animation = 'none';
        setTimeout(() => {
            enterBtn.style.animation = 'pulse 2s infinite';
        }, 1000);
    });
}

// Flèche de défilement
document.addEventListener('DOMContentLoaded', function() {
    const scrollArrow = document.getElementById('scroll-down-arrow');
    
    if (scrollArrow) {
        scrollArrow.addEventListener('click', () => {
            const gallerySection = document.querySelector('.scene-3d-gallery');
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Effets sur les cartes optimisés
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-3d-card');
    
    projectCards.forEach(card => {
        const preview = card.querySelector('.preview-placeholder');
        
        // Effets réduits pour éviter le lag
        card.addEventListener('mouseenter', () => {
            if (currentSection !== '3d-gallery') {
                preview.style.transition = 'all 0.3s ease';
                preview.style.background = 'linear-gradient(135deg, #444 0%, #666 100%)';
                preview.style.transform = 'scale(1.01)'; // Effet réduit
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (currentSection !== '3d-gallery') {
                preview.style.background = 'linear-gradient(135deg, #333 0%, #444 100%)';
                preview.style.transform = 'scale(1)';
            }
        });
        
        card.addEventListener('click', () => {
            console.log('Ouverture du projet 3D');
            
            // Effet visuel minimal
            card.style.transition = 'transform 0.15s ease';
            card.style.transform = 'translateY(-5px) scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
});

// Gestion optimisée du redimensionnement
let resizeTimeout;
window.addEventListener('resize', () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
        if (bgCanvas) {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
        
        initParticles();
    }, 200);
});

// Nettoyage et gestion de la visibilité
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});

// Pause plus agressive de l'animation
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isInView = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        isInView = true;
        animate();
    }
});

// Pause quand on scroll trop vite
let scrollPauseTimeout;
document.getElementById('scroll-container').addEventListener('scroll', () => {
    if (currentSection === '3d-gallery') {
        isInView = false;
        clearTimeout(scrollPauseTimeout);
        
        scrollPauseTimeout = setTimeout(() => {
            isInView = true;
            if (!animationId) {
                animate();
            }
        }, 100);
    }
});

// Styles CSS injectés optimisés
const dynamicStyles = `
    .loading-dots {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
    }
    
    .loading-dots span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #f5f5f5;
        animation: loadingDots 1.8s infinite;
    }
    
    .loading-dots span:nth-child(2) {
        animation-delay: 0.4s;
    }
    
    .loading-dots span:nth-child(3) {
        animation-delay: 0.8s;
    }
    
    @keyframes loadingDots {
        0%, 60%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
        }
        30% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

// Injection des styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet); 