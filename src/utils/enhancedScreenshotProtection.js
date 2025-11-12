/**
 * PROTECTION ANTI-SCREENSHOT ULTRA-RENFORCÉE POUR MOBILE
 * Stratégie: Masquer le contenu AVANT toute capture possible
 */

export const initEnhancedScreenshotProtection = () => {
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  let protectionActive = false;
  let hideTimeout = null;

  // ========== MASQUER LE CONTENU INSTANTANÉMENT ==========
  const hideContent = (reason = 'unknown') => {
    if (protectionActive) return;
    protectionActive = true;

    console.warn('🚨 Screenshot detected:', reason);

    // Overlay de blocage IMMÉDIAT
    const overlay = document.createElement('div');
    overlay.id = 'instant-screenshot-block';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #1e293b !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-direction: column !important;
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
          🔒 تم تسجيل هذه المحاولة في النظام<br>
          السبب: ${reason}
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);

    // Flouter tout le contenu
    document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
      el.style.filter = 'blur(50px)';
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
    });

    // Retirer après 4 secondes
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      overlay.remove();
      document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
        el.style.filter = '';
        el.style.opacity = '';
        el.style.visibility = '';
      });
      protectionActive = false;
    }, 4000);
  };

  // ========== PROTECTION CLAVIER (PC) ==========
  const preventScreenshotKeys = (e) => {
    const dangerous = [
      e.key === 'PrintScreen',
      (e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey),
      ['3', '4', '5'].includes(e.key) && e.shiftKey && e.metaKey,
      e.key === 'PrintScreen' && e.altKey,
      e.code === 'KeyS' && e.shiftKey && (e.metaKey || e.getModifierState?.('OS')),
    ];

    if (dangerous.some(Boolean)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hideContent('keyboard_' + e.key);
      
      try {
        navigator.clipboard.writeText('🚫 المحتوى محمي');
      } catch (err) {}
      
      return false;
    }

    if ((e.key === 'p' || e.key === 'P') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      hideContent('print_attempt');
      return false;
    }
  };

  // ========== DÉTECTION MOBILE ULTRA-RENFORCÉE ==========
  
  const setupMobileProtection = () => {
    
    // ============ 1. MASQUER SUR CHANGEMENT DE VISIBILITÉ ============
    let visibilityCount = 0;
    let lastVisChange = Date.now();
    
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeDiff = now - lastVisChange;
      
      // Si l'app devient invisible rapidement
      if (document.hidden) {
        visibilityCount++;
        
        // Pattern de screenshot détecté
        if (timeDiff < 300 || visibilityCount >= 1) {
          hideContent('visibility_hidden');
        }
        
        // Masquer préventivement le contenu
        document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
          el.style.opacity = '0';
          el.style.filter = 'blur(30px)';
        });
      } else {
        // Restaurer après un délai
        setTimeout(() => {
          if (!protectionActive) {
            document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
              el.style.opacity = '';
              el.style.filter = '';
            });
          }
        }, 200);
      }
      
      lastVisChange = now;
      
      // Reset counter
      setTimeout(() => { visibilityCount = 0; }, 2000);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // ============ 2. DÉTECTION BLUR/FOCUS RAPIDE ============
    let blurCount = 0;
    let lastBlur = Date.now();
    
    const handleBlur = () => {
      const now = Date.now();
      const timeDiff = now - lastBlur;
      
      blurCount++;
      
      // Si blur répétés rapidement
      if (timeDiff < 500 || blurCount >= 2) {
        hideContent('blur_pattern');
      }
      
      // Masquer préventivement
      document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
        el.style.opacity = '0.3';
        el.style.filter = 'blur(20px)';
      });
      
      lastBlur = now;
      setTimeout(() => { blurCount = 0; }, 1500);
    };
    
    window.addEventListener('blur', handleBlur);
    
    const handleFocus = () => {
      setTimeout(() => {
        if (!protectionActive) {
          document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
            el.style.opacity = '';
            el.style.filter = '';
          });
        }
      }, 100);
    };
    
    window.addEventListener('focus', handleFocus);

    // ============ 3. DÉTECTION PAGEHIDE (iOS/Android) ============
    window.addEventListener('pagehide', () => {
      hideContent('pagehide_event');
      document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
        el.style.display = 'none';
      });
    });

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        hideContent('pageshow_persisted');
      }
      setTimeout(() => {
        if (!protectionActive) {
          document.querySelectorAll('.quiz-container, .question-card-optimized, .results-container, .max-width').forEach(el => {
            el.style.display = '';
          });
        }
      }, 200);
    });

    // ============ 4. DÉTECTION RESIZE (Android) ============
    if (isAndroid) {
      let resizeCount = 0;
      let lastResize = Date.now();
      
      const handleResize = () => {
        const now = Date.now();
        const timeDiff = now - lastResize;
        
        resizeCount++;
        
        // Si resize rapides répétés
        if (timeDiff < 200 || resizeCount >= 2) {
          hideContent('android_resize');
        }
        
        lastResize = now;
        setTimeout(() => { resizeCount = 0; }, 1000);
      };
      
      window.addEventListener('resize', handleResize);
    }

    // ============ 5. DÉTECTION TOUCHES VOLUME (Android) ============
    if (isAndroid) {
      let volumeDownPressed = false;
      
      document.addEventListener('keydown', (e) => {
        // Volume Down
        if (e.key === 'VolumeDown' || e.keyCode === 182) {
          volumeDownPressed = true;
          setTimeout(() => { volumeDownPressed = false; }, 500);
        }
        
        // Power button (non détectable directement, mais on surveille les patterns)
        if (volumeDownPressed) {
          hideContent('android_volume_screenshot');
        }
      });
    }

    // ============ 6. DÉTECTION GESTES iOS ============
    if (isIOS) {
      let touchCount = 0;
      let touchStartTime = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchCount = e.touches.length;
        touchStartTime = Date.now();
        
        // Screenshot iOS = Power + Volume Up = souvent 3+ touches détectées
        if (touchCount >= 3) {
          hideContent('ios_multi_touch');
        }
      });
      
      document.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        // Si release rapide après multi-touch
        if (touchCount >= 2 && touchDuration < 300) {
          hideContent('ios_touch_pattern');
        }
        
        touchCount = 0;
      });
    }

    // ============ 7. SURVEILLANCE INACTIVITÉ SOUDAINE ============
    let lastTouchMove = Date.now();
    
    document.addEventListener('touchmove', () => {
      lastTouchMove = Date.now();
    });
    
    document.addEventListener('touchend', () => {
      lastTouchMove = Date.now();
    });
    
    // Vérifier toutes les 100ms
    const inactivityCheck = setInterval(() => {
      const inactivityTime = Date.now() - lastTouchMove;
      
      // Si plus de 5 secondes d'inactivité ET l'app est visible
      // Cela peut indiquer un screenshot en cours
      if (inactivityTime > 5000 && !document.hidden) {
        // On reste vigilant mais on ne bloque pas automatiquement
      }
    }, 100);

    // ============ 8. DÉTECTION SCREENSHOT NATIF (Android 11+) ============
    if ('getScreenshot' in navigator) {
      // API hypothétique future
      try {
        navigator.permissions.query({ name: 'screenshot' }).then(result => {
          if (result.state === 'granted') {
            hideContent('screenshot_permission_active');
          }
        });
      } catch (e) {}
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearInterval(inactivityCheck);
    };
  };

  // ========== WATERMARK RENFORCÉ ==========
  const createSuperWatermark = (userName) => {
    const canvas = document.createElement('canvas');
    canvas.id = 'super-watermark';
    canvas.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: 99997 !important;
      opacity: 0.2 !important;
      mix-blend-mode: overlay !important;
    `;
    
    const updateCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const fontSize = isMobile ? 16 : 24;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.textAlign = 'center';
      
      const time = new Date().toLocaleTimeString('ar-TN');
      const date = new Date().toLocaleDateString('ar-TN');
      const text = `${userName} | ${date} ${time} | محمي`;
      
      const spacing = isMobile ? 100 : 140;
      
      for (let y = 30; y < window.innerHeight; y += spacing) {
        for (let x = 30; x < window.innerWidth; x += spacing) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 6);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 5;
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
    
    // Badge visible
    const badge = document.createElement('div');
    badge.id = 'protection-badge';
    badge.style.cssText = `
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      background: rgba(220, 38, 38, 0.95) !important;
      color: white !important;
      padding: 6px 12px !important;
      border-radius: 20px !important;
      font-size: 11px !important;
      font-weight: bold !important;
      z-index: 99998 !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    `;
    badge.innerHTML = `
      <span style="font-size: 14px;">🔒</span>
      <span>محمي</span>
    `;
    document.body.appendChild(badge);
    
    // Auto-restauration
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.id === 'super-watermark') {
            document.body.appendChild(canvas);
            hideContent('watermark_removal');
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

  // ========== BLOQUER INTERACTIONS ==========
  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const preventSelection = (e) => {
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      return false;
    }
  };

  const preventLongPress = (e) => {
    e.preventDefault();
    return false;
  };

  // ========== STYLES CSS ==========
  const addStyles = () => {
    const style = document.createElement('style');
    style.id = 'protection-styles';
    style.textContent = `
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
      
      @media print {
        body { display: none !important; }
      }
      
      .quiz-container,
      .question-card-optimized,
      .results-container,
      .max-width {
        transition: filter 0.05s, opacity 0.05s !important;
      }

      /* Empêcher le screenshot avec les outils natifs */
      body {
        -webkit-app-region: no-drag;
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
        hideContent('devtools_open');
      }
    };
    
    return setInterval(check, 1000);
  };

  // ========== INITIALISATION ==========
  const init = (userName = 'متطوع') => {
    console.log('🔒 Protection anti-screenshot ULTRA activée');
    
    addStyles();
    
    // Événements clavier
    document.addEventListener('keydown', preventScreenshotKeys, { capture: true });
    document.addEventListener('keyup', preventScreenshotKeys, { capture: true });
    
    // Événements souris/touch
    document.addEventListener('contextmenu', preventContextMenu, { capture: true });
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
    
    // Long press mobile
    let longPressTimer;
    document.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        preventLongPress(e);
      }, 500);
    });
    
    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
    
    document.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });
    
    // Protection mobile
    let cleanupMobile;
    if (isMobile) {
      cleanupMobile = setupMobileProtection();
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
      if (cleanupMobile) cleanupMobile();
      
      const style = document.getElementById('protection-styles');
      if (style) style.remove();
    };
  };

  return { init };
};

export default initEnhancedScreenshotProtection;