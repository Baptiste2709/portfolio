import React from 'react';
import './GallerySection.css';

const GallerySection = () => {
  const projects = [
    {
      id: 1,
      title: "Modélisation Architecturale",
      description: "Création d'environnements architecturaux réalistes avec attention aux détails et à l'éclairage cinématographique.",
      tags: ["Blender", "Cycles", "Photoshop"]
    },
    {
      id: 2,
      title: "Personnage Stylisé",
      description: "Design et modélisation de personnages originaux avec un style artistique unique et des animations expressives.",
      tags: ["ZBrush", "Blender", "Substance"]
    },
    {
      id: 3,
      title: "Animation Mécanique",
      description: "Animation technique de mécanismes complexes avec précision des mouvements et rendu photoréaliste.",
      tags: ["Cinema 4D", "Octane", "After Effects"]
    },
    {
      id: 4,
      title: "Environnement Fantastique",
      description: "Création d'univers fantastiques immersifs avec une atmosphère unique et des effets visuels captivants.",
      tags: ["Blender", "World Creator", "Photoshop"]
    },
    {
      id: 5,
      title: "Produit Commercial",
      description: "Visualisation 3D de produits pour campagnes marketing avec éclairage studio et rendu haute qualité.",
      tags: ["KeyShot", "Fusion 360", "Photoshop"]
    },
    {
      id: 6,
      title: "Sculpture Digitale",
      description: "Art numérique et sculpture organique avec exploration des formes abstraites et textures complexes.",
      tags: ["ZBrush", "Blender", "Marmoset"]
    }
  ];

  return (
    <section className="scene scene-3d-gallery">
      <div className="gallery-content">
        <h2>Créations 3D</h2>
        <p>Découvrez mes projets 3D, de la modélisation à l'animation</p>
        
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-3d-card">
              <div className="project-3d-preview">
                <div className="preview-placeholder">
                  <span>Aperçu 3D</span>
                </div>
              </div>
              <div className="project-3d-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection; 