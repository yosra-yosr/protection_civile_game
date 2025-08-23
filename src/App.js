import React, { useEffect , Suspense } from 'react';
import { initGA } from './utils/analytics';
import './App.css';

// Lazy loading des composants
const ProtectionCivileQuizGame = React.lazy(() => import('./components/ProtectionCivileQuizGame'));
const Footer = React.lazy(() => import('./components/Footer'));

// Composant de chargement professionnel avec skeleton loading
const GlobalLoadingSpinner = React.memo(() => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Animated background particles */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.1,
      background: `
        radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
        radial-gradient(circle at 80% 50%, white 2px, transparent 2px),
        radial-gradient(circle at 40% 80%, white 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 80px 80px, 60px 60px',
      animation: 'floatParticles 20s linear infinite'
    }}></div>

    {/* Main loading content */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Logo placeholder avec animation */}
      <div style={{
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Shimmer effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          animation: 'shimmer 2s infinite'
        }}></div>
      </div>

      {/* Modern loading dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'white',
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
            }}
          ></div>
        ))}
      </div>

      {/* Loading text with typing animation */}
      <div style={{
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: '12px',
        fontFamily: 'Arial, sans-serif'
      }}>
        جاري تحميل التطبيق
        <span style={{
          animation: 'typing 1.5s infinite'
        }}>...</span>
      </div>

      {/* Subtitle */}
      <div style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        لعبة التطوع في خدمة الحماية المدنية
      </div>

      {/* Progress bar */}
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        marginTop: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: 'white',
          borderRadius: '2px',
          animation: 'progress 2s ease-in-out infinite'
        }}></div>
      </div>
    </div>

    {/* CSS Animations */}
    <style jsx>{`
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          left: -100%;
        }
        100% {
          left: 100%;
        }
      }

      @keyframes typing {
        0%, 60% {
          opacity: 1;
        }
        30% {
          opacity: 0;
        }
      }

      @keyframes progress {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(250%);
        }
      }

      @keyframes floatParticles {
        0% {
          transform: translateY(0px) rotate(0deg);
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
        }
      }
    `}</style>
  </div>
));

// Composant de chargement pour le footer (plus léger)
const FooterLoader = React.memo(() => (
  <div style={{
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    position: 'relative'
  }}>
    {/* Skeleton loading pour le footer */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      maxWidth: '400px',
      padding: '20px'
    }}>
      {/* Logo skeleton */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonLoading 2s infinite'
      }}></div>
      
      {/* Text lines skeleton */}
      <div style={{
        width: '120px',
        height: '16px',
        borderRadius: '8px',
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonLoading 2s infinite 0.1s'
      }}></div>
      
      <div style={{
        width: '80px',
        height: '12px',
        borderRadius: '6px',
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonLoading 2s infinite 0.2s'
      }}></div>
    </div>

    <style jsx>{`
      @keyframes skeletonLoading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `}</style>
  </div>
));

// Composant de chargement pour les sections internes
// const SectionLoader = React.memo(({ height = '200px', text = 'جاري التحميل...' }) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height,
//     padding: '20px'
//   }}>
//     {/* Pulse animation */}
//     <div style={{
//       width: '48px',
//       height: '48px',
//       borderRadius: '50%',
//       background: 'linear-gradient(45deg, #667eea, #764ba2)',
//       position: 'relative',
//       marginBottom: '16px'
//     }}>
//       <div style={{
//         position: 'absolute',
//         top: '50%',
//         left: '50%',
//         width: '100%',
//         height: '100%',
//         borderRadius: '50%',
//         background: 'linear-gradient(45deg, #667eea, #764ba2)',
//         transform: 'translate(-50%, -50%)',
//         animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
//       }}></div>
//       <div style={{
//         position: 'absolute',
//         top: '50%',
//         left: '50%',
//         width: '100%',
//         height: '100%',
//         borderRadius: '50%',
//         background: 'linear-gradient(45deg, #667eea, #764ba2)',
//         transform: 'translate(-50%, -50%)',
//         animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s'
//       }}></div>
//     </div>

//     <span style={{
//       color: '#64748b',
//       fontSize: '14px',
//       fontWeight: '500'
//     }}>
//       {text}
//     </span>

//     <style jsx>{`
//       @keyframes pulse {
//         0%, 100% {
//           opacity: 1;
//           transform: translate(-50%, -50%) scale(1);
//         }
//         50% {
//           opacity: 0.5;
//           transform: translate(-50%, -50%) scale(1.1);
//         }
//       }
//     `}</style>
//   </div>
// ));

// Composant d'erreur amélioré
const ErrorBoundary = React.memo(({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Application Error:', error);
      setHasError(true);
      setErrorDetails(error.message || 'خطأ غير معروف');
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event);
      setHasError(true);
      setErrorDetails(event.reason?.message || 'خطأ في العملية غير المتزامنة');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          {/* Error icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '24px'
          }}>
            ⚠️
          </div>

          <h2 style={{
            color: '#dc2626',
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            حدث خطأ في التطبيق
          </h2>
          
          <p style={{
            color: '#6b7280',
            marginBottom: '8px',
            fontSize: '16px'
          }}>
            يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً
          </p>
          
          {errorDetails && (
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#374151',
              textAlign: 'left',
              direction: 'ltr'
            }}>
              {errorDetails}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  return children;
});

function App() {
   useEffect(() => {
    initGA();
  }, []);
  return (
    <ErrorBoundary>
      <Suspense fallback={<GlobalLoadingSpinner />}>
        <ProtectionCivileQuizGame />
        <Suspense fallback={<FooterLoader />}>
          <Footer />
        </Suspense>
      </Suspense>
    </ErrorBoundary>
  );
}

export default React.memo(App);