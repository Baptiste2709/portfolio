import React from 'react';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <section className="scene scene-contact">
      <div className="contact-content">
        <h2>Collaborons</h2>
        <p>
          Prêt à donner vie à vos idées en 3D ?<br />
          Contactez-moi pour discuter de votre projet.
        </p>
        <div className="contact-links">
          <a href="mailto:baptiste.michaud@email.com" className="contact-btn">
            Email
          </a>
          <a href="https://linkedin.com/in/baptiste-michaud" className="contact-btn" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://behance.net/baptiste-michaud" className="contact-btn" target="_blank" rel="noopener noreferrer">
            Behance
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 