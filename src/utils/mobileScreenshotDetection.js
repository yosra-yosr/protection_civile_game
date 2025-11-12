// utils/mobileScreenshotDetection.js

/**
 * Détection avancée des captures d'écran sur mobile
 * Utilise plusieurs indicateurs pour détecter les tentatives
 */

export const initMobileScreenshotDetection = () => {
  
  // 1. Détection de capture via l'API Screen Capture (Chrome/Android)
  const detectScreenCapture = async () => {
    try {
      if ('getDisplayMedia' in navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = new Proxy(
          navigator.mediaDevices.getDisplayMedia,
          {
            apply: function(target, thisArg, argumentsList) {
              alert('⚠️ تم اكتشاف محاولة تسجيل الشاشة!');
              console.warn('Screen capture attempt detected!');
              // Enregistrer la tentative
              logSecurityEvent('screen_capture_attempt');
              throw new Error('Screen capture is not allowed');
            }
          }
        );
      }
    } catch (error) {
      console.warn('Could not setup screen capture detection:', error);
    }
  };

  // 2. Détection de screenshot sur iOS/Android via visibilitychange
  let lastVisibilityChange = Date.now();
  const detectQuickVisibilityChange = () => {
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const timeDiff = now - lastVisibilityChange;
      
      // Si changement très rapide (< 500ms), probable screenshot
      if (timeDiff < 500 && document.hidden) {
        console.warn('⚠️ Possible screenshot detected (quick visibility change)');
        showScreenshotWarning();
        logSecurityEvent('possible_screenshot');
      }
      
      lastVisibilityChange = now;
    });
  };

  // 3. Détection via résolution et orientation (certains devices)
  const detectScreenshotViaResize = () => {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Vérifier si la résolution suggère un screenshot
        const ratio = window.devicePixelRatio;
        if (ratio > 3) { // Ratio anormal peut indiquer screenshot
          console.warn('Unusual pixel ratio detected');
        }
      }, 100);
    });
  };

  // 4. Watermark avec canvas (plus difficile à enlever)
  const createCanvasWatermark = (userName) => {
    const canvas = document.createElement('canvas');
    canvas.id = 'security-watermark';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9997;
      opacity: 0.15;
      mix-blend-mode: multiply;
    `;
    
    const updateCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.textAlign = 'center';
      
      const text = `${userName} - ${new Date().toLocaleString('ar-TN')}`;
      const spacing = 200;
      
      // Créer un pattern répétitif
      for (let y = 0; y < canvas.height; y += spacing) {
        for (let x = 0; x < canvas.width; x += spacing) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 4);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    };
    
    updateCanvas();
    setInterval(updateCanvas, 2000); // Mise à jour régulière
    
    document.body.appendChild(canvas);
    
    // Empêcher la suppression du canvas
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.id === 'security-watermark') {
              document.body.appendChild(canvas);
              alert('⚠️ تحذير أمني: محاولة تعديل عناصر الحماية');
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true });
  };

  // 5. Afficher un avertissement
  const showScreenshotWarning = () => {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 30px;
      border-radius: 12px;
      z-index: 99999;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      animation: shake 0.5s;
    `;
    
    warning.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <div>تم اكتشاف محاولة التقاط شاشة!</div>
      <div style="font-size: 14px; margin-top: 12px; opacity: 0.9;">
        هذا السلوك مخالف لشروط الاستخدام
      </div>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      warning.remove();
    }, 3000);
  };

  // 6. Logger les événements de sécurité
  const logSecurityEvent = (eventType) => {
    const logData = {
      type: eventType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      devicePixelRatio: window.devicePixelRatio
    };
    
    console.warn('Security Event:', logData);
    
    // Envoyer au backend (à implémenter)
    // fetch('/api/security-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // });
  };

  // 7. Bloquer les extensions de screenshot
  const blockScreenshotExtensions = () => {
    // Détecter certaines extensions connues
    const checkExtensions = setInterval(() => {
      const suspiciousElements = document.querySelectorAll(
        '[class*="screenshot"], [id*="screenshot"], [class*="capture"], [id*="capture"]'
      );
      
      if (suspiciousElements.length > 0) {
        console.warn('Suspicious screenshot extension elements detected');
        Array.from(suspiciousElements).forEach(el => {
          if (!el.id?.includes('screenshot-protection')) {
            el.remove();
          }
        });
      }
    }, 1000);
    
    return () => clearInterval(checkExtensions);
  };

  // Initialisation
  const init = (userName = 'متطوع') => {
    detectScreenCapture();
    detectQuickVisibilityChange();
    detectScreenshotViaResize();
    createCanvasWatermark(userName);
    const cleanupExtensions = blockScreenshotExtensions();
    
    // Ajouter animation shake pour les avertissements
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        25% { transform: translate(-50%, -50%) translateX(-10px); }
        75% { transform: translate(-50%, -50%) translateX(10px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      cleanupExtensions();
      const canvas = document.getElementById('security-watermark');
      if (canvas) canvas.remove();
    };
  };

  return { init };
};

export default initMobileScreenshotDetection;