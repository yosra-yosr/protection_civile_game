import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  RightOutlined,
  LeftOutlined,
  HomeOutlined,
  ReloadOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { QuestionRenderer } from './QuestionTypes';
// Lazy loading pour les données
import { domains, badges as badgesList, gameSettings, playerProgress } from './data.js';
import '../styles/app.css';
import { 
  initGA, 
  trackPlayerRegistration, 
  trackCategorySelection, 
  trackQuizStart, 
  trackAnswer, 
  trackQuizComplete, 
  trackQuizExit, 
  trackBadgeEarned,
  trackQuizEvent
} from '../utils/analytics.js';
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
      {!error && (
        <img
          src={src}
          alt={alt}
          className={className}
          onClick={onClick}
          title={title}
          loading="lazy"
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
  const [, setSelectedAnswer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [imageZoom, setImageZoom] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
const [playerProgressData, setPlayerProgressData] = useState({ domains: {} });
 useEffect(() => {
    initGA();
  }, []);

  // Optimisation: Mémoriser la question actuelle
const getCurrentQuestion = useCallback(() => {
  if (!selectedCategory || !selectedDomain) return null;
  return domains[selectedDomain]?.categories[selectedCategory]?.questions[currentQuestionIndex];
}, [selectedCategory, selectedDomain, currentQuestionIndex]);
  // Optimisation: Mémoriser les données de catégorie
 const categoryData = useMemo(() => {
  return selectedCategory && selectedDomain ? domains[selectedDomain]?.categories[selectedCategory] : null;
}, [selectedCategory, selectedDomain]);

const updatePlayerProgress = useCallback((domainKey, categoryName, score, percentage) => {
  setPlayerProgressData(prev => {
    const newProgress = { ...prev };
    if (!newProgress.domains[domainKey]) {
      newProgress.domains[domainKey] = {};
    }
    newProgress.domains[domainKey][categoryName] = {
      completed: percentage >= 60, // ou votre seuil de réussite
      score,
      percentage
    };
    return newProgress;
  });
}, []);


  // Optimisation: Mémoriser si la question est répondue
  const isQuestionAnswered = useMemo(() => {
    return answeredQuestions[currentQuestionIndex]?.answered || false;
  }, [answeredQuestions, currentQuestionIndex]);

  // Optimisation: Debounce pour les clics rapides
  const [isProcessing, setIsProcessing] = useState(false);
const getUserAnswerForQuestion = useCallback((questionIndex) => {
  const questionData = answeredQuestions[questionIndex];
  if (!questionData) return null;
  
  const question = categoryData?.questions[questionIndex];
  
  switch (question?.type) {
    case 'fill-in-blanks':
      return questionData.userAnswers;
    case 'multiple-checkbox':
      return questionData.selectedAnswers;
    case 'drag-drop-timeline':
    case 'reorder':
      return questionData.userOrder;
    case 'match-arrows':
      return questionData.userMatches;
    case 'true-false':
    default:
      return questionData.selectedAnswer;
  }
}, [answeredQuestions, categoryData]);

const handleAnswer = useCallback(async (answerData) => {
  if (isProcessing || isQuestionAnswered) return;
  
  setIsProcessing(true);
  
  const question = getCurrentQuestion();
  let pointsEarned = 0;
   let isCorrect = false;

  // Gérer différents types de questions
  switch (question?.type) {
    case 'fill-in-blanks':
      setShowAnswer(true);
      
      let correctCount = 0;
      question.blanks.forEach(blank => {
        if (answerData[blank.id] === blank.correctAnswer) {
          correctCount++;
        }
      });
      
      const percentage = correctCount / question.blanks.length;
       isCorrect = percentage === 1;
      if (percentage === 1) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
      } else if (percentage >= 0.7) {
        pointsEarned = Math.floor(gameSettings.pointsPerCorrectAnswer * percentage);
      }

      setScore(prevScore => prevScore + pointsEarned);
      
      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          userAnswers: answerData,
          answered: true,
          pointsEarned: pointsEarned,
          correctCount: correctCount,
          totalBlanks: question.blanks.length
        }
      }));
      break;

    case 'true-false':
      setSelectedAnswer(answerData);
      setShowAnswer(true);
isCorrect = question && answerData === question.correct; // NOUVEAU

      if (question && answerData === question.correct) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
        setScore(prevScore => prevScore + pointsEarned);
      }

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          selectedAnswer: answerData,
          correct: question?.correct,
          answered: true,
          pointsEarned: pointsEarned
        }
      }));
      break;

    case 'multiple-checkbox':
      setShowAnswer(true);
      
      // Calculer le score basé sur les bonnes réponses
      let correctSelections = 0;
      // let totalCorrectOptions = question.options.filter(opt => opt.correct).length;
      
      question.options.forEach(option => {
        const isSelected = answerData.includes(option.id);
        if (option.correct && isSelected) {
          correctSelections++;
        } else if (!option.correct && !isSelected) {
          correctSelections++;
        }
      });
      
      const accuracy = correctSelections / question.options.length;
      isCorrect = accuracy >= 0.8; 
      if (accuracy >= 0.8) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = Math.floor((gameSettings.pointsPerCorrectAnswer * accuracy) + timeBonus);
        setScore(prevScore => prevScore + pointsEarned);
      }

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          selectedAnswers: answerData,
          answered: true,
          pointsEarned: pointsEarned,
          correctSelections: correctSelections,
          totalOptions: question.options.length
        }
      }));
      break;

    case 'drag-drop-timeline':
    case 'reorder':
      setShowAnswer(true);
      
      // Vérifier si l'ordre est correct - gérer les cas où answerData peut être null ou incomplet
      let isOrderCorrect = false;
      if (answerData && Array.isArray(answerData) && answerData.length === question.items.length) {
        isOrderCorrect = answerData.every((item, index) => 
          item && item.order === index + 1
        );
      }
       isCorrect = isOrderCorrect; 

      if (isOrderCorrect) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
        setScore(prevScore => prevScore + pointsEarned);
      }

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          userOrder: answerData || [],
          answered: true,
          pointsEarned: pointsEarned,
          isCorrect: isOrderCorrect
        }
      }));
      break;

    case 'match-arrows':
      setShowAnswer(true);
      
      // Calculer les bonnes correspondances - gérer les cas où answerData peut être null
      let correctMatches = 0;
      if (answerData && Array.isArray(answerData)) {
        answerData.forEach(match => {
          const isMatchCorrect = question.correctMatches.some(
            cm => cm.left === match.left && cm.right === match.right
          );
          if (isMatchCorrect) correctMatches++;
        });
      }
      
      const matchAccuracy = question.correctMatches.length > 0 ? correctMatches / question.correctMatches.length : 0;
     isCorrect = matchAccuracy === 1; 
      if (matchAccuracy === 1) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
        setScore(prevScore => prevScore + pointsEarned);
      }

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          userMatches: answerData || [],
          answered: true,
          pointsEarned: pointsEarned,
          correctMatches: correctMatches,
          totalMatches: question.correctMatches.length
        }
      }));
      break;

    default:
      // Question QCM classique
      setSelectedAnswer(answerData);
      setShowAnswer(true);
 isCorrect = question && answerData === question.correct; // NOUVEAU

      if (isCorrect) {
        const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
        pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
        setScore(prevScore => prevScore + pointsEarned);
      }

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          selectedAnswer: answerData,
          correct: question?.correct,
          answered: true,
          pointsEarned: pointsEarned
        }
      }));
      break;
  }
 trackAnswer(
      selectedCategory, 
      currentQuestionIndex, 
      isCorrect, 
      timeLeft, 
      question?.type || 'qcm'
    );
  // Vérifier les badges
  const newScore = score + pointsEarned;
  badgesList.forEach(badge => {
    if (newScore >= badge.requirement && !badges.includes(badge.name)) {
      setBadges(prev => [...prev, badge.name]);
       trackBadgeEarned(badge.name);
    }
  });

  setTimeout(() => setIsProcessing(false), 300);
}, [getCurrentQuestion, timeLeft, score, badges, currentQuestionIndex, isQuestionAnswered, isProcessing, selectedCategory]);

  // Timer logic
  useEffect(() => {
    if (currentScreen !== 'quiz' || showAnswer || isQuestionAnswered || timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [timeLeft, showAnswer, currentScreen, isQuestionAnswered]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0 && !showAnswer && !isQuestionAnswered && currentScreen === 'quiz') {
      const question = getCurrentQuestion();
      if (question?.type === 'fill-in-blanks') {
        handleAnswer({});
      } else {
        handleAnswer(null);
      }
    }
  }, [timeLeft, showAnswer, isQuestionAnswered, currentScreen, handleAnswer, getCurrentQuestion]);

 const nextQuestion = useCallback(() => {
    if (!categoryData) return;
    
    if (currentQuestionIndex < categoryData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const nextQuestionData = answeredQuestions[nextIndex];
      if (nextQuestionData?.answered) {
        setShowAnswer(true);
        const nextQuestion = categoryData.questions[nextIndex];
        switch (nextQuestion?.type) {
          case 'true-false':
          case 'qcm':
          default:
            setSelectedAnswer(nextQuestionData.selectedAnswer);
            break;
        }
        setTimeLeft(0);
      } else {
        setTimeLeft(gameSettings.questionTime);
        setShowAnswer(false);
        setSelectedAnswer(null);
      }
    } else {
      // NOUVEAU: Quiz terminé - calculer et tracker les résultats
      let correctAnswers = 0;
      let totalPossiblePoints = 0;
      
      Object.entries(answeredQuestions).forEach(([questionIndex, questionData]) => {
        if (!questionData.answered) return;
        
        const question = categoryData?.questions[parseInt(questionIndex)];
        
        if (question?.type === 'fill-in-blanks') {
          totalPossiblePoints += question.blanks.length;
          correctAnswers += questionData.correctCount || 0;
        } else {
          totalPossiblePoints += 1;
          if (questionData.selectedAnswer === question?.correct) {
            correctAnswers += 1;
          }
        }
      });
      
      const percentage = totalPossiblePoints > 0 ? Math.round((correctAnswers / totalPossiblePoints) * 100) : 0;
      
      updatePlayerProgress(selectedDomain, selectedCategory, score, percentage);
      const domainProgress = playerProgress.getDomainProgress(selectedDomain, playerProgressData);
if (domainProgress.percentage === 100) {
  const domainBadge = badgesList.find(b => b.requirement === `complete_${domains[selectedDomain].id}_domain`);
  if (domainBadge && !badges.includes(domainBadge.name)) {
    setBadges(prev => [...prev, domainBadge.name]);
    trackBadgeEarned(domainBadge.name);
  }
}
      // Tracker la completion du quiz
      trackQuizComplete(selectedCategory, score, totalPossiblePoints, correctAnswers, percentage);
      
      setCurrentScreen('results');
    }
  }, [categoryData, currentQuestionIndex, answeredQuestions, selectedCategory, score,badges,playerProgressData,selectedDomain,updatePlayerProgress]);

 const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // NOUVEAU: Tracker la navigation précédente
      trackQuizEvent('navigation_previous', selectedCategory, {
        custom_from_question: currentQuestionIndex + 1,
        custom_to_question: currentQuestionIndex
      });
      
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      const prevQuestionData = answeredQuestions[prevIndex];
      if (prevQuestionData?.answered) {
        setShowAnswer(true);
        const prevQuestion = categoryData.questions[prevIndex];
        switch (prevQuestion?.type) {
          case 'true-false':
          case 'qcm':
          default:
            setSelectedAnswer(prevQuestionData.selectedAnswer);
            break;
        }
        setTimeLeft(0);
      } else {
        setShowAnswer(false);
        setSelectedAnswer(null);
        setTimeLeft(gameSettings.questionTime);
      }
    }
  }, [currentQuestionIndex, answeredQuestions, categoryData, selectedCategory]);

 const startGame = useCallback((domainKey, category) => {
  setSelectedDomain(domainKey);
  setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(gameSettings.questionTime);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setCurrentScreen('quiz');
    
    // NOUVEAU: Tracker la sélection de catégorie et le début du quiz
   trackCategorySelection(`${domainKey}-${category}`);
  const categoryData = domains[domainKey].categories[category];
  if (categoryData) {
    trackQuizStart(`${domainKey}-${category}`, categoryData.questions.length);
  }
  }, []);

  const resetGame = useCallback(() => {
    trackQuizEvent('back_to_home', selectedDomain ? `${selectedDomain}-${selectedCategory}` : selectedCategory, {
    custom_final_score: score
  });
  setCurrentScreen('home');
  setSelectedDomain(null); // Ajouter cette ligne
  setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBadges([]);
    setAnsweredQuestions({});
    setImageZoom(null);
    setShowExitConfirm(false);
  }, [score,selectedDomain,selectedCategory]);

  const handleNameSubmit = useCallback(() => {
    if (tempPlayerName.trim()) {
      setPlayerName(tempPlayerName.trim());
      // NOUVEAU: Tracker l'enregistrement du joueur
      trackPlayerRegistration(tempPlayerName.trim());
    }
  }, [tempPlayerName]);

 const handleImageZoom = useCallback((imageSrc) => {
    setImageZoom(imageSrc);
    // NOUVEAU: Tracker l'utilisation du zoom
    trackQuizEvent('image_zoom', selectedCategory, {
      custom_question_index: currentQuestionIndex + 1
    });
  }, [selectedCategory, currentQuestionIndex]);

  const closeImageZoom = useCallback(() => {
    setImageZoom(null);
  }, []);

  const handleExitQuiz = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

const confirmExitQuiz = useCallback(() => {
    // NOUVEAU: Tracker l'abandon du quiz
    trackQuizExit(selectedCategory, currentQuestionIndex, score);
    setShowExitConfirm(false);
    resetGame();
  }, [resetGame, selectedCategory, currentQuestionIndex, score]);


  const cancelExitQuiz = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

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
            {/* Conteneur des logos pour mobile */}
            <div className="logos-mobile-container">
              <div className="logo-container">
                <img
                  src={`${process.env.PUBLIC_URL}/protection_civile_Tunisie.webp`}
                  srcSet={`${process.env.PUBLIC_URL}/protection_civile_Tunisie_petite.webp 480w, ${process.env.PUBLIC_URL}/protection_civile_Tunisie.webp 1080w`}
                  sizes="50vw"
                  alt="Protection Civile Tunisie"
                  className="logo"
                />
              </div>
              
              <div className="logo-container">
                <img
                  src={`${process.env.PUBLIC_URL}/LogoAVSPCBenArous.png`}
                  sizes="50vw"
                  alt="Protection Civile Tunisie"
                  className="logo"
                />
              </div>
            </div>
            
            {/* Conteneur du titre */}
            <div className="title-container">
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
                مرحبا أيها المتطوع <span className="welcome-name">{playerName}</span> 👩‍🚒
              </p>
              <p className="welcome-subtitle">اختر فئة الأسئلة لتبدأ التحدي</p>
            </div>

          
<div className="domains-container">
  {Object.entries(domains)
    .sort(([,a], [,b]) => a.order - b.order)
    .map(([domainKey, domainData]) => {
      const isUnlocked = playerProgress.isDomainUnlocked(domainData.id, playerProgressData);
      const progress = playerProgress.getDomainProgress(domainKey, playerProgressData);
      
      return (
        <div key={domainKey} className="domain-section">
          <div className={`domain-header ${!isUnlocked ? 'locked' : ''}`}>
            <div className="domain-info">
              <span className="domain-icon">{domainData.icon}</span>
              <div>
                <h3 className="domain-title">{domainKey}</h3>
                <p className="domain-description">{domainData.description}</p>
                {progress.total > 0 && (
                  <div className="domain-progress">
                    التقدم: {progress.completed}/{progress.total} ({progress.percentage}%)
                  </div>
                )}
              </div>
            </div>
            {!isUnlocked && <span className="lock-icon">🔒</span>}
          </div>
          
          {isUnlocked && (
            <div className={`categories-grid ${isSmallMobile ? 'mobile-single' : isMobile ? 'mobile-double' : ''}`}>
              {Object.entries(domainData.categories).map(([categoryName, categoryData]) => {
                const categoryProgress = playerProgressData.domains?.[domainKey]?.[categoryName];
                
                return (
                  <div
                    key={categoryName}
                    onClick={() => startGame(domainKey, categoryName)}
                    className="category-card smooth-transition hover-glow"
                    style={{background: categoryData.gradient}}
                  >
                    <div className="category-header">
                      <span className="category-icon">{categoryData.icon}</span>
                      {categoryProgress?.completed && <span className="completed-badge">✓</span>}
                    </div>
                    
                    <h4 className="category-title">{categoryName}</h4>
                    <p className="category-description">
                      {categoryData.questions.length} سؤال
                      {categoryProgress && (
                        <span className="category-score"> • {categoryProgress.percentage}%</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
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
                  <HomeOutlined /> الخروج
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
                <span className="image-indicator">📷</span>
              )}
              {question.type === 'fill-in-blanks' && (
                <span className="question-type-indicator">📝 املأ الفراغات</span>
              )}
            </div>

   <QuestionRenderer
  question={question}
  onAnswer={handleAnswer}
  showAnswer={showAnswer}
  isQuestionAnswered={isQuestionAnswered}
  userAnswer={getUserAnswerForQuestion(currentQuestionIndex)}
  handleImageZoom={handleImageZoom}
/>

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
    // const totalQuestions = categoryData?.questions.length || 0;
    
    // Calculate results differently for fill-in-blanks vs normal questions
    let correctAnswers = 0;
    let totalPossiblePoints = 0;
    
    Object.entries(answeredQuestions).forEach(([questionIndex, questionData]) => {
      if (!questionData.answered) return;
      
      const question = categoryData?.questions[parseInt(questionIndex)];
      
      if (question?.type === 'fill-in-blanks') {
        // For fill-in-blanks, count individual blanks
        totalPossiblePoints += question.blanks.length;
        correctAnswers += questionData.correctCount || 0;
      } else {
        // For normal questions
        totalPossiblePoints += 1;
        if (questionData.selectedAnswer === question?.correct) {
          correctAnswers += 1;
        }
      }
    });
    
    const percentage = totalPossiblePoints > 0 ? Math.round((correctAnswers / totalPossiblePoints) * 100) : 0;
    
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
                  <h2 className="results-stat-number score">{correctAnswers}/{totalPossiblePoints}</h2>
                  <p className="results-stat-label">
                    {categoryData?.type === 'fill-in-blanks' ? 'الإجابات الصحيحة' : 'الأسئلة الصحيحة'}
                  </p>
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
    )
  }
};

export default ProtectionCivileQuizGame;