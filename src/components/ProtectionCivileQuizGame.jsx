import React, { useState, useEffect, useCallback } from 'react';
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
import { questionCategories, badges as badgesList, gameSettings } from './data.js';

// Import des fichiers CSS
import '../styles/main.css';
import '../styles/header.css';
import '../styles/forms.css';
import '../styles/cards.css';
import '../styles/quiz.css';
import '../styles/results.css';
import '../styles/image-quiz.css';

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
  const [answeredQuestions, setAnsweredQuestions] = useState({}); // Historique des réponses
  const [imageZoom, setImageZoom] = useState(null); // État pour le zoom d'image
  const [showExitConfirm, setShowExitConfirm] = useState(false); // État pour la popup de sortie

  const getCurrentQuestion = useCallback(() => {
    if (!selectedCategory) return null;
    return questionCategories[selectedCategory].questions[currentQuestionIndex];
  }, [selectedCategory, currentQuestionIndex]);

  const handleAnswer = useCallback((answerIndex) => {
    const question = getCurrentQuestion();
    
    // Vérifier si la question n'a pas déjà été répondue
    if (answeredQuestions[currentQuestionIndex]?.answered) {
      return; // Ne pas permettre de répondre à nouveau
    }

    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    // Calculer les points seulement si c'est la première fois qu'on répond
    let pointsEarned = 0;
    if (question && answerIndex === question.correct) {
      const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
      pointsEarned = gameSettings.pointsPerCorrectAnswer + timeBonus;
      setScore(prevScore => prevScore + pointsEarned);
    }

    // Sauvegarder la réponse dans l'historique
    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        selectedAnswer: answerIndex,
        correct: question?.correct,
        answered: true,
        pointsEarned: pointsEarned // Sauvegarder les points gagnés pour cette question
      }
    }));

    // Vérifier les nouveaux badges seulement si des points ont été gagnés
    if (pointsEarned > 0) {
      const newScore = score + pointsEarned;
      badgesList.forEach(badge => {
        if (newScore >= badge.requirement && !badges.includes(badge.name)) {
          setBadges(prev => [...prev, badge.name]);
        }
      });
    }
  }, [getCurrentQuestion, timeLeft, score, badges, currentQuestionIndex, answeredQuestions]);

  useEffect(() => {
    // Ne démarrer le timer que si la question n'a pas été répondue
    const questionData = answeredQuestions[currentQuestionIndex];
    const isQuestionAnswered = questionData?.answered;

    if (currentScreen === 'quiz' && timeLeft > 0 && !showAnswer && !isQuestionAnswered) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer && !isQuestionAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, showAnswer, currentScreen, handleAnswer, currentQuestionIndex, answeredQuestions]);

  const nextQuestion = () => {
    const categoryQuestions = questionCategories[selectedCategory].questions;
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Vérifier si la question suivante a déjà été répondue
      const nextQuestionData = answeredQuestions[nextIndex];
      if (nextQuestionData && nextQuestionData.answered) {
        setShowAnswer(true);
        setSelectedAnswer(nextQuestionData.selectedAnswer);
        setTimeLeft(0); // Pas de timer pour les questions déjà répondues
      } else {
        setTimeLeft(gameSettings.questionTime);
        setShowAnswer(false);
        setSelectedAnswer(null);
      }
    } else {
      setCurrentScreen('results');
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      // Restaurer l'état de la question précédente
      const prevQuestionData = answeredQuestions[prevIndex];
      if (prevQuestionData && prevQuestionData.answered) {
        setShowAnswer(true);
        setSelectedAnswer(prevQuestionData.selectedAnswer);
        setTimeLeft(0); // Pas de timer pour les questions déjà répondues
      } else {
        setShowAnswer(false);
        setSelectedAnswer(null);
        setTimeLeft(gameSettings.questionTime);
      }
    }
  };

  const startGame = (category) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(gameSettings.questionTime);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setCurrentScreen('quiz');
  };

  const resetGame = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBadges([]);
    setAnsweredQuestions({});
    setImageZoom(null);
    setShowExitConfirm(false); // Réinitialiser l'état de la popup
  };

  const handleNameSubmit = () => {
    if (tempPlayerName.trim()) {
      setPlayerName(tempPlayerName.trim());
    }
  };

  // Fonction pour détecter si une image est verticale
  const isVerticalImage = (imagePath) => {
    // Cette fonction peut être améliorée avec une détection réelle des dimensions
    // Pour l'instant, on peut supposer que certains noms de fichiers indiquent une orientation
    return imagePath && (
      imagePath.includes('vertical') || 
      imagePath.includes('portrait') ||
      imagePath.includes('tall')
    );
  };

  // Fonction pour ouvrir le zoom d'image
  const handleImageZoom = (imageSrc) => {
    setImageZoom(imageSrc);
  };

  // Fonction pour fermer le zoom d'image
  const closeImageZoom = () => {
    setImageZoom(null);
  };

  // Fonction pour afficher la popup de sortie
  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  // Fonction pour confirmer la sortie
  const confirmExitQuiz = () => {
    setShowExitConfirm(false);
    resetGame();
  };

  // Fonction pour annuler la sortie
  const cancelExitQuiz = () => {
    setShowExitConfirm(false);
  };

  // Home Screen (inchangé)
  if (currentScreen === 'home') {
    return (
      <div className="quiz-container">
        <div className="max-width">
          {/* Enhanced Header */}
          <div className="header">
            <div className="decorative-circle decorative-circle-blue"></div>
            <div className="decorative-circle decorative-circle-green"></div>
            
            <div className="header-flex">
              <div className="logo-container">
                <img 
                  src={`${process.env.PUBLIC_URL}/Écusson_protection_civile,_Tunisie.png`}
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

          {/* Player Name Input */}
          {!playerName && (
            <div className="card card-enhanced">
              <div className="decorative-bg-primary"></div>
              
              <h3 style={{
                fontSize: window.innerWidth <= 768 ? '1.5rem' : '1.9rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center', 
                marginBottom: '28px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                zIndex: 1
              }}>أدخل اسمك للبدء</h3>
              
              <div className={`input-container ${window.innerWidth <= 768 ? 'mobile' : ''}`}>
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
              {/* Welcome Message */}
              <div className="welcome-card">
                <p className="welcome-text">
                  مرحبا <span className="welcome-name">{playerName}</span>! 🎖️
                </p>
                <p className="welcome-subtitle">اختر فئة الأسئلة لتبدأ التحدي</p>
              </div>

              {/* Categories Grid */}
              <div className={`grid-three ${window.innerWidth <= 480 ? 'mobile-single' : window.innerWidth <= 768 ? 'mobile-double' : ''}`}>
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
                        fontSize: window.innerWidth <= 768 ? '1.6rem' : '2rem', 
                        opacity: 0.8,
                        color: 'rgba(255, 255, 255, 0.9)'
                      }} />
                    </div>
                    
                    <h4 className="category-title">{category}</h4>
                    <p className="category-description">{data.questions.length} سؤال</p>
                  </div>
                ))}
              </div>

              {/* Badges Display */}
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

  // Quiz Screen - Amélioré
  if (currentScreen === 'quiz') {
    const question = getCurrentQuestion();
    const categoryData = questionCategories[selectedCategory];
    const isVertical = question?.image && isVerticalImage(question.image);
    const isQuestionAnswered = answeredQuestions[currentQuestionIndex]?.answered;

    return (
      <div className="quiz-container">
        <div className="quiz-container-wrapper">
          {/* Header amélioré */}
          <div className="quiz-header">
            <div className="quiz-header-left">
              <span className="quiz-category-icon">{categoryData.icon}</span>
              <div>
                <h4 className="quiz-category-title">{selectedCategory}</h4>
                <p className="quiz-player-name">{playerName}</p>
              </div>
            </div>
            <div className="quiz-header-right">
              <div className="quiz-timer-container">
                <ClockCircleOutlined />
                <h3 className={`quiz-timer ${timeLeft <= 5 && !isQuestionAnswered ? 'warning' : ''}`}>
                  {isQuestionAnswered ? '✓' : timeLeft}
                </h3>
              </div>
              <p className="quiz-score">النقاط: {score}</p>
              <button 
                onClick={handleExitQuiz}
                className="quiz-exit-button"
                title="الخروج من اللعبة"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  marginLeft: '12px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                <HomeOutlined style={{marginRight: '4px'}} />
                خروج
              </button>
            </div>
          </div>

          {/* Progress Bar améliorée */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${((currentQuestionIndex + 1) / categoryData.questions.length) * 100}%`
              }}
            ></div>
          </div>

          <div className="question-card">
            {/* Question Number */}
            <div className="question-number">
              <span className="question-badge">
                السؤال {currentQuestionIndex + 1} من {categoryData.questions.length}
                {isQuestionAnswered && <span style={{marginLeft: '8px', color: '#22c55e'}}>✓ تم الإجابة</span>}
              </span>
              {question?.image && (
                <span className="question-with-image-indicator">
                  سؤال مع صورة
                </span>
              )}
            </div>

            {/* Question Text */}
            <h3 className="question-text">
              {question?.question}
            </h3>

            {/* Image Display - Amélioré */}
            {question?.image && (
              <div className={`question-image-container ${isVertical ? 'vertical' : ''}`}>
                <img 
                  src={`${process.env.PUBLIC_URL}${question.image}`}
                  alt="سؤال عملي"
                  className={`question-image ${isVertical ? 'vertical' : ''}`}
                  onClick={() => handleImageZoom(`${process.env.PUBLIC_URL}${question.image}`)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.log('Image not found:', question.image);
                  }}
                  style={{ cursor: 'pointer' }}
                  title="انقر للتكبير"
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ZoomInOutlined />
                  انقر للتكبير
                </div>
              </div>
            )}

            {/* Options */}
            <div className="options-container">
              {question?.options.map((option, index) => {
                let buttonClass = 'option-button smooth-transition';
                
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
                    onClick={() => !showAnswer && !isQuestionAnswered && handleAnswer(index)}
                    disabled={showAnswer || isQuestionAnswered}
                    className={buttonClass}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {showAnswer && question?.explanation && (
              <div className="explanation-card">
                <h5 className="explanation-title">💡 التفسير:</h5>
                <p className="explanation-text">{question.explanation}</p>
              </div>
            )}

            {/* Navigation Buttons - Amélioré */}
            {(showAnswer || isQuestionAnswered) && (
              <div className="question-navigation">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="nav-button previous"
                >
                  <LeftOutlined />
                  السؤال السابق
                </button>

                <button
                  onClick={nextQuestion}
                  className="next-button"
                >
                  {currentQuestionIndex < categoryData.questions.length - 1 ? 'السؤال التالي' : 'عرض النتائج 🏆'}
                  <RightOutlined />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Zoom Modal */}
        {imageZoom && (
          <div className="image-zoom-overlay" onClick={closeImageZoom}>
            <div className="image-zoom-container" onClick={(e) => e.stopPropagation()}>
              <img 
                src={imageZoom} 
                alt="صورة مكبرة" 
                className="image-zoom"
              />
              <button 
                className="image-zoom-close"
                onClick={closeImageZoom}
              >
                <CloseOutlined />
              </button>
            </div>
          </div>
        )}

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div style={{
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
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '16px'
              }}>⚠️</div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                هل أنت متأكد من الخروج؟
              </h3>
              
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                marginBottom: '28px',
                lineHeight: '1.6'
              }}>
                سيتم فقدان جميع إجاباتك والنقاط المحصلة
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={confirmExitQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  نعم، الخروج
                </button>
                
                <button
                  onClick={cancelExitQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Results Screen
  if (currentScreen === 'results') {
    const totalQuestions = questionCategories[selectedCategory].questions.length;
    
    // Calculer le nombre de réponses correctes
    const correctAnswers = Object.values(answeredQuestions).filter(questionData => {
      if (!questionData.answered) return false;
      const questionIndex = Object.keys(answeredQuestions).find(key => answeredQuestions[key] === questionData);
      const question = questionCategories[selectedCategory].questions[parseInt(questionIndex)];
      return questionData.selectedAnswer === question?.correct;
    }).length;
    
    // Pourcentage basé sur les réponses correctes uniquement
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