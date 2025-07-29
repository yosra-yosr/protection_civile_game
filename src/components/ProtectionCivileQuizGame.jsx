import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrophyOutlined, 
  ClockCircleOutlined,  
  AimOutlined, 
  RightOutlined,
  LeftOutlined,
  HomeOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  CloseOutlined
} from '@ant-design/icons';

// Lazy loading pour les données (si possible, sinon garder l'import normal)
import { questionCategories, badges as badgesList, gameSettings } from './data.js';

// Optimisation: Combiner tous les styles en un seul import
import '../styles/app.css'; // Fichier combiné de tous vos styles CSS

// Composant de chargement léger
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    جاري التحميل...
  </div>
);

// Composant d'image optimisé avec lazy loading
const OptimizedImage = React.memo(({ src, alt, className, onClick, style, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="image-container" style={{ position: 'relative', ...style }}>
      {/* {!loaded && !error && (
        <div className="image-placeholder" style={{
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '150px',
          borderRadius: '8px'
        }}>
          جاري تحميل الصورة...
        </div>
      )} */}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={className}
          onClick={onClick}
          title={title}
          loading="lazy" // Native lazy loading
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            console.warn('Image failed to load:', src);
          }}
          style={{
            display: loaded ? 'block' : 'none',
            ...style
          }}
        />
      )}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          فشل في تحميل الصورة
        </div>
      )}
    </div>
  );
});

// Composant modal optimisé
const Modal = React.memo(({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      {children}
    </div>
  );
});

const ProtectionCivileQuizGame = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerName, setPlayerName] = useState('');
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [imageZoom, setImageZoom] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Optimisation: Mémoriser la question actuelle
  const getCurrentQuestion = useCallback(() => {
    if (!selectedCategory) return null;
    return questionCategories[selectedCategory]?.questions[currentQuestionIndex];
  }, [selectedCategory, currentQuestionIndex]);

  // Optimisation: Mémoriser les données de catégorie
  const categoryData = useMemo(() => {
    return selectedCategory ? questionCategories[selectedCategory] : null;
  }, [selectedCategory]);

  // Optimisation: Mémoriser si la question est répondue
  const isQuestionAnswered = useMemo(() => {
    return answeredQuestions[currentQuestionIndex]?.answered || false;
  }, [answeredQuestions, currentQuestionIndex]);

  // Optimisation: Debounce pour les clics rapides
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnswer = useCallback(async (answerIndex) => {
    if (isProcessing || isQuestionAnswered) return;
    
    setIsProcessing(true);
    
    const question = getCurrentQuestion();
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    let pointsEarned = 0;
    if (question && answerIndex === question.correct) {
      const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
      pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
      setScore(prevScore => prevScore + pointsEarned);
    }

    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        selectedAnswer: answerIndex,
        correct: question?.correct,
        answered: true,
        pointsEarned: pointsEarned
      }
    }));

    if (pointsEarned > 0) {
      const newScore = score + pointsEarned;
      badgesList.forEach(badge => {
        if (newScore >= badge.requirement && !badges.includes(badge.name)) {
          setBadges(prev => [...prev, badge.name]);
        }
      });
    }

    // Petit délai pour éviter les clics rapides
    setTimeout(() => setIsProcessing(false), 300);
  }, [getCurrentQuestion, timeLeft, score, badges, currentQuestionIndex, isQuestionAnswered, isProcessing]);

  // Optimisation du timer
  useEffect(() => {
    if (currentScreen !== 'quiz' || showAnswer || isQuestionAnswered || timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showAnswer, currentScreen, isQuestionAnswered]);

  // Auto-submit quand le temps est écoulé
  useEffect(() => {
    if (timeLeft === 0 && !showAnswer && !isQuestionAnswered && currentScreen === 'quiz') {
      handleAnswer(null);
    }
  }, [timeLeft, showAnswer, isQuestionAnswered, currentScreen, handleAnswer]);

  const nextQuestion = useCallback(() => {
    if (!categoryData) return;
    
    if (currentQuestionIndex < categoryData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const nextQuestionData = answeredQuestions[nextIndex];
      if (nextQuestionData?.answered) {
        setShowAnswer(true);
        setSelectedAnswer(nextQuestionData.selectedAnswer);
        setTimeLeft(0);
      } else {
        setTimeLeft(gameSettings.questionTime);
        setShowAnswer(false);
        setSelectedAnswer(null);
      }
    } else {
      setCurrentScreen('results');
    }
  }, [categoryData, currentQuestionIndex, answeredQuestions]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      const prevQuestionData = answeredQuestions[prevIndex];
      if (prevQuestionData?.answered) {
        setShowAnswer(true);
        setSelectedAnswer(prevQuestionData.selectedAnswer);
        setTimeLeft(0);
      } else {
        setShowAnswer(false);
        setSelectedAnswer(null);
        setTimeLeft(gameSettings.questionTime);
      }
    }
  }, [currentQuestionIndex, answeredQuestions]);

  const startGame = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(gameSettings.questionTime);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setCurrentScreen('quiz');
  }, []);

  const resetGame = useCallback(() => {
    setCurrentScreen('home');
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBadges([]);
    setAnsweredQuestions({});
    setImageZoom(null);
    setShowExitConfirm(false);
  }, []);

  const handleNameSubmit = useCallback(() => {
    if (tempPlayerName.trim()) {
      setPlayerName(tempPlayerName.trim());
    }
  }, [tempPlayerName]);

  // Optimisation: Mémoriser les fonctions de modal
  const handleImageZoom = useCallback((imageSrc) => {
    setImageZoom(imageSrc);
  }, []);

  const closeImageZoom = useCallback(() => {
    setImageZoom(null);
  }, []);

  const handleExitQuiz = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExitQuiz = useCallback(() => {
    setShowExitConfirm(false);
    resetGame();
  }, [resetGame]);

  const cancelExitQuiz = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Optimisation: Mémoriser les styles responsive
  const isMobile = useMemo(() => window.innerWidth <= 768, []);
  const isSmallMobile = useMemo(() => window.innerWidth <= 480, []);

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="quiz-container">
        <div className="max-width">
          <div className="header">
            <div className="decorative-circle decorative-circle-blue"></div>
            <div className="decorative-circle decorative-circle-green"></div>
            
            <div className="header-flex">
              <div className="logo-container">
                <img
                  src={`${process.env.PUBLIC_URL}/protection_civile_Tunisie.png`}
                  alt="Protection Civile Tunisie" 
                  className="logo"
                />
              </div>
              
              <div style={{flex: 1, textAlign: 'center', position: 'relative', zIndex: 2}}>
                <h1 className="title">لعبة التطوع في خدمة الحماية المدنية</h1>
                
                <div className="slogan-container">
                  <div className="slogan-bg"></div>
                  <p className="slogan-text">وقاية • نجدة • إنقاذ</p>
                </div>
              </div>
            </div>
          </div>

          {!playerName && (
            <div className="card card-enhanced">
              <div className="decorative-bg-primary"></div>
              
              <h1 style={{
                fontSize: isMobile ? '1.5rem' : '1.9rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center', 
                marginBottom: '28px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                zIndex: 1
              }}>أدخل اسمك للبدء</h1>
              
              <div className={`input-container ${isMobile ? 'mobile' : ''}`}>
                <input
                  type="text"
                  placeholder="اسم المتطوع..."
                  className="input-field focus-outline smooth-transition"
                  value={tempPlayerName}
                  onChange={(e) => setTempPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
                <button
                  onClick={handleNameSubmit}
                  disabled={!tempPlayerName.trim()}
                  className="button-primary focus-outline"
                >
                  ابدأ
                </button>
              </div>
            </div>
          )}

          {playerName && (
            <>
              <div className="welcome-card">
                <p className="welcome-text">
                  مرحبا <span className="welcome-name">{playerName}</span>! 🎖️
                </p>
                <p className="welcome-subtitle">اختر فئة الأسئلة لتبدأ التحدي</p>
              </div>

              <div className={`grid-three ${isSmallMobile ? 'mobile-single' : isMobile ? 'mobile-double' : ''}`}>
                {Object.entries(questionCategories).map(([category, data]) => (
                  <div
                    key={category}
                    onClick={() => startGame(category)}
                    className="category-card smooth-transition hover-glow"
                    style={{background: data.gradient}}
                    data-category={category}
                  >
                    <div className="category-header">
                      <span className="category-icon">{data.icon}</span>
                      <AimOutlined style={{
                        fontSize: isMobile ? '1.6rem' : '2rem', 
                        opacity: 0.8,
                        color: 'rgba(255, 255, 255, 0.9)'
                      }} />
                    </div>
                    
                    <h4 className="category-title">{category}</h4>
                    <p className="category-description">{data.questions.length} سؤال</p>
                  </div>
                ))}
              </div>

              {badges.length > 0 && (
                <div className="badges-container">
                  <h3 className="badges-title">🏆 الأوسمة المكتسبة</h3>
                  
                  <div className="badges-list">
                    {badges.map((badge, index) => (
                      <div key={index} className="badge-item smooth-transition">
                        <span className="badge-text">⭐ {badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Quiz Screen
 if (currentScreen === 'quiz') {
    const question = getCurrentQuestion();
    
    if (!question || !categoryData) {
      return <LoadingSpinner />;
    }

    return (
      <div className="quiz-container">
        <div className="quiz-container-wrapper">
          {/* Header compact optimisé */}
          <div className="quiz-header-compact">
            <div className="quiz-header-main">
              <div className="quiz-category-info">
                <span className="quiz-category-icon">{categoryData.icon}</span>
                <div className="quiz-category-details">
                  <h4 className="quiz-category-title">{selectedCategory}</h4>
                  <p className="quiz-player-name">{playerName}</p>
                </div>
              </div>
              
              <div className="quiz-stats-container">
                <div className="quiz-timer-compact">
                  <ClockCircleOutlined className="timer-icon" />
                  <span className={`timer-value ${timeLeft <= 5 && !isQuestionAnswered ? 'warning' : ''}`}>
                    {isQuestionAnswered ? '✓' : timeLeft}
                  </span>
                </div>
                
                <div className="quiz-score-compact">
                  <span className="score-label">النقاط</span>
                  <span className="score-value">{score}</span>
                </div>
                
                <button 
                  onClick={handleExitQuiz}
                  className="quiz-exit-button-compact"
                  title="الخروج من اللعبة"
                >
                  <HomeOutlined />
                </button>
              </div>
            </div>

            {/* Progress bar intégrée */}
            <div className="progress-bar-integrated">
              <div 
                className="progress-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / categoryData.questions.length) * 100}%`
                }}
              ></div>
              <span className="progress-text">
                {currentQuestionIndex + 1} / {categoryData.questions.length}
              </span>
            </div>
          </div>

          {/* Question Card optimisée */}
          <div className="question-card-optimized">
            <div className="question-header-compact">
              <span className="question-badge-compact">
                السؤال {currentQuestionIndex + 1}
                {isQuestionAnswered && <span className="answered-indicator">✓</span>}
              </span>
              {question.image && (
                <span className="image-indicator">
                  📷
                </span>
              )}
            </div>

            <h3 className="question-text-optimized">
              {question.question}
            </h3>

           {question.image && (
  <div className="question-image-container-compact">
    <picture>
      <source srcSet={`${process.env.PUBLIC_URL}${question.image}`} type="image/webp" />
      <img 
        src={`${process.env.PUBLIC_URL}${question.image.replace('.webp', '.jpg')}`} // Remplacez par le format de secours
        alt="سؤال عملي"
        className="question-image-compact"
        onClick={() => handleImageZoom(`${process.env.PUBLIC_URL}${question.image}`)}
        style={{ cursor: 'pointer' }}
        title="انقر للتكبير"
      />
    </picture>
    <div className="zoom-indicator-compact">
      <ZoomInOutlined />
    </div>
  </div>
)}


            <div className="options-container-optimized">
              {question.options.map((option, index) => {
                let buttonClass = 'option-button-optimized smooth-transition';
                
                if (showAnswer) {
                  if (index === question.correct) {
                    buttonClass += ' correct';
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    buttonClass += ' wrong';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showAnswer || isQuestionAnswered || isProcessing}
                    className={buttonClass}
                  >
                    <span className="option-letter-compact">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {showAnswer && question.explanation && (
              <div className="explanation-card-compact">
                <div className="explanation-header">
                  <span className="explanation-icon">💡</span>
                  <span className="explanation-title-compact">التفسير</span>
                </div>
                <p className="explanation-text-compact">{question.explanation}</p>
              </div>
            )}

            {(showAnswer || isQuestionAnswered) && (
              <div className="question-navigation-compact">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="nav-button-compact previous"
                >
                  <LeftOutlined />
                  السابق
                </button>

                <button
                  onClick={nextQuestion}
                  className="next-button-compact"
                >
                  {currentQuestionIndex < categoryData.questions.length - 1 ? (
                    <>التالي <RightOutlined /></>
                  ) : (
                    <>النتائج 🏆</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Zoom Modal optimisé */}
        <Modal isOpen={!!imageZoom} onClose={closeImageZoom}>
          <div className="image-zoom-container-optimized" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage 
              src={imageZoom} 
              alt="صورة مكبرة" 
              className="image-zoom-optimized"
            />
            <button 
              className="image-zoom-close-optimized"
              onClick={closeImageZoom}
            >
              <CloseOutlined />
            </button>
          </div>
        </Modal>

        {/* Exit Confirmation Modal optimisé */}
        <Modal isOpen={showExitConfirm} onClose={cancelExitQuiz}>
          <div className="exit-confirm-modal-optimized">
            <div className="exit-confirm-content">
              <div className="exit-confirm-icon">⚠️</div>
              <h3 className="exit-confirm-title-compact">هل تريد الخروج؟</h3>
              <p className="exit-confirm-text-compact">ستفقد التقدم الحالي</p>
              
              <div className="exit-confirm-buttons-compact">
                <button onClick={confirmExitQuiz} className="exit-button danger">
                  خروج
                </button>
                <button onClick={cancelExitQuiz} className="exit-button cancel">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
  
  // Results Screen
  if (currentScreen === 'results') {
    const totalQuestions = categoryData?.questions.length || 0;
    
    const correctAnswers = Object.values(answeredQuestions).filter(questionData => {
      if (!questionData.answered) return false;
      const questionIndex = Object.keys(answeredQuestions).find(key => answeredQuestions[key] === questionData);
      const question = categoryData?.questions[parseInt(questionIndex)];
      return questionData.selectedAnswer === question?.correct;
    }).length;
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    let performance = '';
    let performanceClass = '';
    
    if (percentage >= 80) {
      performance = 'ممتاز! 🏆';
      performanceClass = 'excellent';
    } else if (percentage >= 60) {
      performance = 'جيد جداً! 👍';
      performanceClass = 'good';
    } else if (percentage >= 40) {
      performance = 'جيد 📚';
      performanceClass = 'average';
    } else {
      performance = 'يحتاج تحسين 💪';
      performanceClass = 'poor';
    }

    return (
      <div className="results-container">
        <div className="results-card">
          <div className="card results-animation">
            <div className="results-header">
              <TrophyOutlined className="results-trophy" />
              <h2 className="results-title">النتائج النهائية</h2>
              <p className="results-category">فئة: {selectedCategory}</p>
            </div>

            <div className="card" style={{marginBottom: '32px'}}>
              <div className="results-stats">
                <div className="results-stat">
                  <h2 className="results-stat-number score">{score}</h2>
                  <p className="results-stat-label">إجمالي النقاط</p>
                </div>
                <div className="results-stat">
                  <h2 className="results-stat-number score">{correctAnswers}/{totalQuestions}</h2>
                  <p className="results-stat-label">الإجابات الصحيحة</p>
                </div>
                <div className="results-stat">
                  <h2 className={`results-stat-number percentage ${performanceClass}`}>{percentage}%</h2>
                  <p className="results-stat-label">نسبة النجاح</p>
                </div>
              </div>
              
              <div className="results-divider"></div>
              <h3 className={`results-performance ${performanceClass}`}>{performance}</h3>
            </div>

            <div className="results-buttons">
              <button
                onClick={() => startGame(selectedCategory)}
                className="results-button-retry"
              >
                <ReloadOutlined />
                إعادة المحاولة 
              </button>
              <button
                onClick={resetGame}
                className="results-button-home"
              >
                <HomeOutlined />
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ProtectionCivileQuizGame;