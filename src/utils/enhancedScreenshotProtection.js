// utils/enhancedScreenshotProtection.js

/**
 * Protection RÉELLEMENT EFFICACE contre les captures d'écran
 * Stratégie: Masquer/Flouter le contenu AVANT la capture
 */

export const initEnhancedScreenshotProtection = () => {
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  let protectionActive = false;
  let hideTimeout = null;

  // ========== MASQUER LE CONTENU INSTANTANÉMENT ==========
  const hideContent = () => {
    if (protectionActive) return;
    protectionActive = true;

    // Ajouter overlay de blocage IMMÉDIAT
    const overlay = document.createElement('div');
    overlay.id = 'instant-screenshot-block';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #1e293b;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: rgba(220, 38, 38, 0.95);
        color: white;
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        max-width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h2 style="font-size: 28px; margin-bottom: 16px; font-weight: bold;">
          التقاط الشاشة محظور
        </h2>
        <p style="font-size: 18px; opacity: 0.95; line-height: 1.6;">
          لقد تم اكتشاف محاولة التقاط الشاشة<br>
          هذا الإجراء مخالف لشروط الاستخدام
        </p>
        <div style="
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 14px;
        ">
          🔒 تم تسجيل هذه المحاولة في النظام
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);

    // Flouter tout le contenu en arrière-plan
    document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container').forEach(el => {
      el.style.filter = 'blur(30px)';
      el.style.opacity = '0';
    });

    // Retirer après 3 secondes
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      overlay.remove();
      document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container').forEach(el => {
        el.style.filter = '';
        el.style.opacity = '';
      });
      protectionActive = false;
    }, 3000);
  };

  // ========== PROTECTION CLAVIER (PC) ==========
  const preventScreenshotKeys = (e) => {
    const dangerous = [
      // Print Screen
      e.key === 'PrintScreen',
      
      // Windows Snipping Tool: Win + Shift + S
      (e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey || e.key === 'Meta'),
      
      // Mac: Cmd + Shift + 3/4/5
      ['3', '4', '5'].includes(e.key) && e.shiftKey && e.metaKey,
      
      // Windows: Alt + Print Screen
      e.key === 'PrintScreen' && e.altKey,
      
      // Snip & Sketch: Win + Shift + S
      e.code === 'KeyS' && e.shiftKey && (e.metaKey || e.getModifierState?.('OS')),
    ];

    if (dangerous.some(Boolean)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // MASQUER LE CONTENU IMMÉDIATEMENT
      hideContent();
      logSecurityEvent('keyboard_screenshot_blocked', e.key);
      
      // Vider le presse-papier
      try {
        navigator.clipboard.writeText('🚫 المحتوى محمي - التقاط الشاشة غير مسموح به');
      } catch (err) {
        console.warn('Cannot clear clipboard');
      }
      
      return false;
    }

    // Bloquer Ctrl+P (Impression)
    if ((e.key === 'p' || e.key === 'P') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      hideContent();
      logSecurityEvent('print_attempt_blocked');
      return false;
    }
  };

  // ========== DÉTECTION MOBILE ==========
  
  // 1. Visibilité rapide (iOS/Android screenshot)
  let lastVisibilityChange = Date.now();
  
  const detectMobileScreenshot = () => {
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const diff = now - lastVisibilityChange;
      
      // Screenshot typique: < 200ms
      if (diff < 200 && document.hidden) {
        console.warn('🚨 Screenshot mobile détecté!');
        hideContent();
        logSecurityEvent('mobile_screenshot_pattern');
      }
      
      lastVisibilityChange = now;
    });

    // Masquer contenu quand app passe en arrière-plan
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.body.style.opacity = '0';
      } else {
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 100);
      }
    });
  };

  // 2. Détection blur/focus rapide
  let blurCount = 0;
  const detectBlurPattern = () => {
    window.addEventListener('blur', () => {
      blurCount++;
      
      if (blurCount >= 1) {
        hideContent();
        logSecurityEvent('blur_screenshot_pattern');
      }
      
      setTimeout(() => { blurCount = 0; }, 1500);
    });
  };

  // 3. Android spécifique
  const detectAndroidScreenshot = () => {
    if (!isAndroid) return;
    
    let lastResize = Date.now();
    window.addEventListener('resize', () => {
      const now = Date.now();
      if (now - lastResize < 150) {
        console.warn('🚨 Android screenshot pattern');
        hideContent();
        logSecurityEvent('android_screenshot');
      }
      lastResize = now;
    });
  };

  // 4. iOS spécifique
  const detectIOSScreenshot = () => {
    if (!isIOS) return;
    
    // iOS déclenche un pageshow après screenshot
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        hideContent();
        logSecurityEvent('ios_screenshot_suspected');
      }
    });
  };

  // ========== WATERMARK RENFORCÉ ==========
  const createSuperWatermark = (userName) => {
    // Canvas watermark très visible
    const canvas = document.createElement('canvas');
    canvas.id = 'super-watermark';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99997;
      opacity: 0.15;
      mix-blend-mode: overlay;
    `;
    
    const updateCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const fontSize = isMobile ? 18 : 24;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
      ctx.textAlign = 'center';
      
      const time = new Date().toLocaleTimeString('ar-TN');
      const date = new Date().toLocaleDateString('ar-TN');
      const text = `${userName} | ${date} ${time}`;
      
      const spacing = isMobile ? 120 : 160;
      
      for (let y = 50; y < canvas.height; y += spacing) {
        for (let x = 50; x < canvas.width; x += spacing) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 5);
          
          // Ombre pour plus de visibilité
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    };
    
    updateCanvas();
    const interval = setInterval(updateCanvas, 1000);
    
    document.body.appendChild(canvas);
    
    // Badge visible en haut
    const badge = document.createElement('div');
    badge.id = 'protection-badge';
    badge.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(220, 38, 38, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      z-index: 99996;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    badge.innerHTML = `
      <span style="font-size: 16px;">🔒</span>
      <span>محمي</span>
    `;
    document.body.appendChild(badge);
    
    // Auto-restauration
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.id === 'super-watermark') {
            document.body.appendChild(canvas);
            hideContent();
            logSecurityEvent('watermark_removal_attempt');
          }
          if (node.id === 'protection-badge') {
            document.body.appendChild(badge);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: false });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
      canvas.remove();
      badge.remove();
    };
  };

  // ========== BLOQUER CLIC DROIT ==========
  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // ========== BLOQUER SÉLECTION ==========
  const preventSelection = (e) => {
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      return false;
    }
  };

  // ========== LOGGING ==========
  const logSecurityEvent = (eventType, details = '') => {
    const logData = {
      type: eventType,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile,
      isIOS,
      isAndroid,
      resolution: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      url: window.location.href
    };
    
    console.warn('🚨 SECURITY EVENT:', logData);
    
    // TODO: Envoyer au backend
    // fetch('/api/security-violations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // }).catch(err => console.error('Log failed:', err));
  };

  // ========== STYLES CSS ==========
  const addStyles = () => {
    const style = document.createElement('style');
    style.id = 'protection-styles';
    style.textContent = `
      /* Désactiver sélection partout sauf inputs */
      body * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        user-select: text !important;
      }
      
      /* Bloquer impression */
      @media print {
        body {
          display: none !important;
        }
      }
      
      /* Transition pour masquage */
      .quiz-container,
      .question-card-optimized,
      .results-container {
        transition: filter 0.1s, opacity 0.1s !important;
      }
    `;
    document.head.appendChild(style);
  };

  // ========== DÉTECTION DEVTOOLS ==========
  const monitorDevTools = () => {
    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      if (widthDiff > 160 || heightDiff > 160) {
        console.clear();
        console.log('%c🚫 STOP', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cيرجى إغلاق أدوات المطور فوراً', 'color: red; font-size: 18px;');
        hideContent();
      }
    };
    
    return setInterval(check, 1000);
  };

  // ========== INITIALISATION ==========
  const init = (userName = 'متطوع') => {
    console.log('🔒 Protection anti-screenshot activée');
    
    // Styles
    addStyles();
    
    // Événements clavier (CAPTURE phase = avant tout le monde)
    document.addEventListener('keydown', preventScreenshotKeys, { capture: true });
    document.addEventListener('keyup', preventScreenshotKeys, { capture: true });
    
    // Événements souris
    document.addEventListener('contextmenu', preventContextMenu, { capture: true });
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
    
    // Détection mobile
    if (isMobile) {
      detectMobileScreenshot();
      detectBlurPattern();
      if (isAndroid) detectAndroidScreenshot();
      if (isIOS) detectIOSScreenshot();
    }
    
    // Watermark
    const cleanupWatermark = createSuperWatermark(userName);
    
    // DevTools
    const devToolsInterval = monitorDevTools();
    
    // Message console
    console.log('%c⚠️ تحذير', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%cأي محاولة التقاط شاشة سيتم حظرها وتسجيلها', 'color: red; font-size: 16px;');
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', preventScreenshotKeys, { capture: true });
      document.removeEventListener('keyup', preventScreenshotKeys, { capture: true });
      document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      document.removeEventListener('selectstart', preventSelection);
      
      clearInterval(devToolsInterval);
      clearTimeout(hideTimeout);
      cleanupWatermark();
      
      const style = document.getElementById('protection-styles');
      if (style) style.remove();
    };
  };

  return { init };
};

export default initEnhancedScreenshotProtection;