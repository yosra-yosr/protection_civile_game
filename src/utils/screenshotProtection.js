// utils/screenshotProtection.js

/**
 * Protection avancée contre les captures d'écran
 * Combine plusieurs techniques pour empêcher les screenshots
 */

export const initScreenshotProtection = () => {
  
  // 1. Désactiver les raccourcis clavier de capture d'écran
  const preventScreenshotKeys = (e) => {
    // Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      navigator.clipboard.writeText(''); // Vider le presse-papier
      alert('⚠️ التقاط الشاشة غير مسموح به في هذا التطبيق');
      return false;
    }
    
    // Windows: Win + Shift + S (Snipping Tool)
    if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      alert('⚠️ التقاط الشاشة غير مسموح به في هذا التطبيق');
      return false;
    }
    
    // Mac: Cmd + Shift + 3/4/5
    if ((e.key === '3' || e.key === '4' || e.key === '5') && e.shiftKey && e.metaKey) {
      e.preventDefault();
      alert('⚠️ التقاط الشاشة غير مسموح به في هذا التطبيق');
      return false;
    }
    
    // Ctrl + P (Impression)
    if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      alert('⚠️ الطباعة غير مسموحة');
      return false;
    }
  };

  // 2. Désactiver le clic droit
  const preventContextMenu = (e) => {
    e.preventDefault();
    alert('⚠️ القائمة السياقية غير متاحة');
    return false;
  };

  // 3. Désactiver la sélection de texte
  const preventSelection = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  };

  // 4. Détection de perte de focus (peut indiquer une capture)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Optionnel: masquer temporairement le contenu
      document.body.style.filter = 'blur(20px)';
      console.warn('⚠️ محاولة محتملة لالتقاط الشاشة');
    } else {
      document.body.style.filter = 'none';
    }
  };

  // 5. Overlay invisible pour protection
  const createProtectionOverlay = () => {
    const overlay = document.createElement('div');
    overlay.id = 'screenshot-protection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 0, 0, 0.01) 10px,
        rgba(255, 0, 0, 0.01) 20px
      );
    `;
    document.body.appendChild(overlay);
  };

  // 6. Watermark dynamique (horodatage + ID utilisateur)
  const createDynamicWatermark = (userName) => {
    const watermark = document.createElement('div');
    watermark.id = 'dynamic-watermark';
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48px;
      color: rgba(255, 0, 0, 0.1);
      pointer-events: none;
      z-index: 9998;
      white-space: nowrap;
      user-select: none;
      font-weight: bold;
    `;
    
    const updateWatermark = () => {
      const timestamp = new Date().toLocaleString('ar-TN');
      watermark.textContent = `${userName} - ${timestamp}`;
    };
    
    updateWatermark();
    setInterval(updateWatermark, 1000); // Mise à jour chaque seconde
    
    document.body.appendChild(watermark);
  };

  // 7. Désactiver les outils de développement (moins fiable)
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      console.clear();
      alert('⚠️ يرجى إغلاق أدوات المطور');
    }
  };

  // 8. Protection contre l'enregistrement d'écran (CSS)
  const addScreenRecordingProtection = () => {
    const style = document.createElement('style');
    style.textContent = `
      @media screen and (any-pointer: coarse) {
        .quiz-container * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      }
      
      /* Protection contre les screen readers automatiques */
      .question-card-optimized,
      .explanation-card-compact {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  };

  // Initialisation de toutes les protections
  const init = (userName = 'متطوع') => {
    // Événements
    document.addEventListener('keydown', preventScreenshotKeys, true);
    document.addEventListener('keyup', preventScreenshotKeys, true);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Protections visuelles
    createProtectionOverlay();
    createDynamicWatermark(userName);
    addScreenRecordingProtection();
    
    // Détection outils développeur (optionnel)
    setInterval(detectDevTools, 1000);
    
    // Désactiver le glisser-déposer d'images
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
    
    // Message dans la console
    console.log('%c⚠️ تحذير أمني', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%cأي محاولة لالتقاط الشاشة أو نسخ المحتوى سيتم تسجيلها وقد تؤدي إلى حظر حسابك', 'color: red; font-size: 16px;');
    
    return () => {
      // Nettoyage
      document.removeEventListener('keydown', preventScreenshotKeys, true);
      document.removeEventListener('keyup', preventScreenshotKeys, true);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Supprimer les overlays
      const overlay = document.getElementById('screenshot-protection-overlay');
      const watermark = document.getElementById('dynamic-watermark');
      if (overlay) overlay.remove();
      if (watermark) watermark.remove();
    };
  };

  return { init };
};

// Export pour utilisation facile
export default initScreenshotProtection;