import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF, useProgress } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import './Model3DViewer.css';

// Composant de barre de chargement améliorée
function LoadingProgress() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  const [loadingStage, setLoadingStage] = useState('Initialisation...');
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (progress < 10) {
      setLoadingStage('Connexion au serveur...');
    } else if (progress < 30) {
      setLoadingStage('Téléchargement du modèle...');
    } else if (progress < 60) {
      setLoadingStage('Traitement des données...');
    } else if (progress < 80) {
      setLoadingStage('Optimisation 3D...');
    } else if (progress < 95) {
      setLoadingStage('Finalisation...');
    } else {
      setLoadingStage('Presque prêt !');
    }
  }, [progress]);

  return (
    <Html center>
      <div className="advanced-model-loader">
        <div className="loader-container">
          <div className="loader-icon">
            <div className="loader-cube">
              <div className="cube-face front"></div>
              <div className="cube-face back"></div>
              <div className="cube-face right"></div>
              <div className="cube-face left"></div>
              <div className="cube-face top"></div>
              <div className="cube-face bottom"></div>
            </div>
          </div>
          
          <div className="progress-section">
            <h3 className="loading-title">Chargement du modèle 3D</h3>
            <p className="loading-stage">{loadingStage}</p>
            
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="progress-glow" style={{ left: `${progress}%` }}></div>
              </div>
              <div className="progress-text">
                <span className="progress-percentage">{Math.round(progress)}%</span>
                <span className="progress-details">
                  {loaded}/{total} fichiers • {elapsedTime}s
                </span>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="error-message">
                <span>⚠️ Erreur de chargement détectée</span>
              </div>
            )}
            
            <div className="loading-hints">
              <div className="hint">💡 Le modèle 3D est en haute résolution</div>
              <div className="hint">🎮 Utilisez la molette pour zoomer une fois chargé</div>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

// Composant pour charger FBX de manière asynchrone avec progression
function AsyncFBXModel({ url, ...props }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadFBX = async () => {
      try {
        console.log('Chargement asynchrone FBX:', url);
        
        const loader = new FBXLoader();
        
        // Patch temporaire de THREE.KeyframeTrack pour ignorer les erreurs
        const originalCreate = THREE.KeyframeTrack.prototype.validate;
        THREE.KeyframeTrack.prototype.validate = function() {
          try {
            return originalCreate.call(this);
          } catch (e) {
            if (e.message && e.message.includes('no keyframes in track named')) {
              console.warn('Animation vide ignorée:', this.name);
              return false;
            }
            throw e;
          }
        };
        
        const fbx = await new Promise((resolve, reject) => {
          loader.load(
            url,
            (object) => resolve(object),
            (progress) => {
              if (progress.lengthComputable) {
                const percentComplete = (progress.loaded / progress.total) * 100;
                setLoadingProgress(percentComplete);
                console.log('Progression:', percentComplete);
              }
            },
            (error) => reject(error)
          );
        });
        
        // Restaurer la fonction originale
        THREE.KeyframeTrack.prototype.validate = originalCreate;
        
        console.log('FBX chargé avec succès:', fbx);
        
        // Nettoyer le modèle
        fbx.animations = [];
        fbx.traverse((child) => {
          if (child.animations) child.animations = [];
          if (child.mixer) child.mixer = null;
        });
        
        fbx.scale.setScalar(0.1);
        
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        fbx.position.sub(center);
        
        setModel(fbx);
        setLoading(false);
        
      } catch (err) {
        console.error('Erreur chargement FBX asynchrone:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadFBX();
  }, [url]);

  if (loading) {
    return <LoadingProgress />;
  }

  if (error || !model) {
    return <FallbackModel {...props} />;
  }

  return <primitive object={model} {...props} />;
}

// Composant pour afficher un modèle 3D GLB (format recommandé)
function Model({ url, ...props }) {
  try {
    console.log('Chargement du modèle 3D:', url);
    
    if (url.endsWith('.glb') || url.endsWith('.gltf')) {
      // Charger GLB/GLTF (format recommandé)
      const { scene } = useGLTF(url);
      console.log('Modèle GLB chargé:', scene);
      
      const model = scene.clone();
      model.scale.setScalar(0.1);
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      return <primitive object={model} {...props} />;
      
    } else if (url.endsWith('.fbx')) {
      // Utiliser le loader asynchrone pour FBX
      return <AsyncFBXModel url={url} {...props} />;
      
    } else {
      console.warn('Format non supporté:', url, '- utilisation du modèle de backup');
      return <FallbackModel {...props} />;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du modèle 3D:', error);
    return <FallbackModel {...props} />;
  }
}

// Modèle de fallback en cas d'erreur
function FallbackModel(props) {
  return (
    <group {...props}>
      {/* Base du bâtiment */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
      
      {/* Étage principal */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.5, 1.5, 1.8]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>
      
      {/* Toit */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.8, 0.8, 4]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      
      {/* Fenêtres */}
      <mesh position={[0.6, 0.5, 0.91]}>
        <boxGeometry args={[0.3, 0.4, 0.02]} />
        <meshStandardMaterial color="#2563EB" />
      </mesh>
      <mesh position={[-0.6, 0.5, 0.91]}>
        <boxGeometry args={[0.3, 0.4, 0.02]} />
        <meshStandardMaterial color="#2563EB" />
      </mesh>
      
      {/* Porte */}
      <mesh position={[0, 0.1, 0.91]}>
        <boxGeometry args={[0.4, 0.8, 0.02]} />
        <meshStandardMaterial color="#7C2D12" />
      </mesh>
    </group>
  );
}

// Composant de fallback pour le chargement
function ModelFallback() {
  return <LoadingProgress />;
}

// Error Boundary spécialisé pour les modèles 3D
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.log('Error Boundary capturé:', error.message);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Model Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('Affichage du modèle de fallback à cause d\'une erreur');
      return <FallbackModel {...this.props} />;
    }

    return (
      <Suspense fallback={<ModelFallback />}>
        <Model {...this.props} />
      </Suspense>
    );
  }
}

// Composant avec gestion d'erreur améliorée
function ModelWithErrorBoundary({ url, ...props }) {
  return <ModelErrorBoundary url={url} {...props} />;
}

// Composant principal du viewer 3D
const Model3DViewer = ({ isOpen, onClose }) => {
  const controlsRef = useRef();

  if (!isOpen) return null;

  return (
    <div className="model-viewer-overlay" onClick={onClose}>
      <div className="model-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="model-viewer-close" onClick={onClose}>
          ×
        </button>
        
        <div className="model-viewer-header">
          <h3>Modèle 3D Interactif</h3>
          <div className="model-viewer-controls">
            <span className="control-hint">🖱️ Clic & glisser pour tourner</span>
            <span className="control-hint">🔍 Molette pour zoomer</span>
          </div>
        </div>

        <div className="model-viewer-canvas">
          <Canvas
            camera={{ position: [4, 2, 4], fov: 75 }}
            gl={{ antialias: true }}
          >
            {/* Éclairage */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
            />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Environnement HDRI pour un meilleur rendu */}
            <Environment preset="city" />

            {/* Modèle 3D architectural - Votre fichier 3D */}
            <ModelWithErrorBoundary 
              url="/models/architectural-modeling/building.glb"
              position={[0, 0, 0]}
            />

            {/* Contrôles de caméra */}
            <OrbitControls
              ref={controlsRef}
              enableDamping={true}
              dampingFactor={0.05}
              enableZoom={true}
              enablePan={true}
              minDistance={2}
              maxDistance={15}
              autoRotate={true}
              autoRotateSpeed={1}
              target={[0, 0.5, 0]}
            />
          </Canvas>
        </div>

        <div className="model-viewer-info">
          <div className="model-info-section">
            <h4>À propos du modèle</h4>
            <p>Modèle 3D architectural complet du projet immobilier. Utilisez les contrôles de souris pour explorer le modèle sous tous les angles et découvrir tous les détails.</p>
          </div>
          
          <div className="model-controls-section">
            <h4>Contrôles</h4>
            <div className="control-buttons">
              <button 
                className="control-btn"
                onClick={() => controlsRef.current?.reset()}
              >
                Réinitialiser vue
              </button>
              <button 
                className="control-btn"
                onClick={() => {
                  controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
                }}
              >
                Auto-rotation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DViewer; 