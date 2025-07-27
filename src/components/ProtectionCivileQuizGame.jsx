import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrophyOutlined, 
  ClockCircleOutlined,  
  AimOutlined, 
  RightOutlined,
  HomeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { questionCategories, badges as badgesList, gameSettings } from './data.js';

// Import des fichiers CSS
import '../styles/main.css';
import '../styles/header.css';
import '../styles/forms.css';
import '../styles/cards.css';
import '../styles/quiz.css';
import '../styles/results.css';

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

  const getCurrentQuestion = useCallback(() => {
    if (!selectedCategory) return null;
    return questionCategories[selectedCategory].questions[currentQuestionIndex];
  }, [selectedCategory, currentQuestionIndex]);

  const handleAnswer = useCallback((answerIndex) => {
    const question = getCurrentQuestion();
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    if (question && answerIndex === question.correct) {
      const timeBonus = Math.floor(timeLeft / gameSettings.timeBonusMultiplier);
      const newScore = score + gameSettings.pointsPerCorrectAnswer + timeBonus;
      setScore(newScore);

      // Vérifier les nouveaux badges
      badgesList.forEach(badge => {
        if (newScore >= badge.requirement && !badges.includes(badge.name)) {
          setBadges(prev => [...prev, badge.name]);
        }
      });
    }
  }, [getCurrentQuestion, timeLeft, score, badges]);

  useEffect(() => {
    if (currentScreen === 'quiz' && timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer) {
      handleAnswer(null);
    }
  }, [timeLeft, showAnswer, currentScreen, handleAnswer]);

  const nextQuestion = () => {
    const categoryQuestions = questionCategories[selectedCategory].questions;
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(gameSettings.questionTime);
      setShowAnswer(false);
      setSelectedAnswer(null);
    } else {
      setCurrentScreen('results');
    }
  };

  const startGame = (category) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(gameSettings.questionTime);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentScreen('quiz');
  };

  const resetGame = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBadges([]);
  };

  const handleNameSubmit = () => {
    if (tempPlayerName.trim()) {
      setPlayerName(tempPlayerName.trim());
    }
  };

  // Home Screen
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

              {/* Score Display */}
              {/* <div className={`grid-two ${window.innerWidth <= 768 ? 'mobile' : ''}`}>
                <div className="score-card">
                  <TrophyOutlined className="score-icon score-icon-gold" />
                  <h2 className="score-number">{score}</h2>
                  <p className="score-label">النقاط</p>
                </div>
                
                <div className="badge-card">
                  <CrownOutlined className="score-icon score-icon-purple" />
                  <h2 className="score-number">{badges.length}</h2>
                  <p className="score-label">الأوسمة</p>
                </div>
              </div> */}

              {/* Categories Grid */}
              <div className={`grid-three ${window.innerWidth <= 480 ? 'mobile-single' : window.innerWidth <= 768 ? 'mobile-double' : ''}`}>
                {Object.entries(questionCategories).map(([category, data]) => (
                  <div
                    key={category}
                    onClick={() => startGame(category)}
                    className="category-card smooth-transition hover-glow"
                    style={{background: data.gradient}}
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

  // Quiz Screen
  if (currentScreen === 'quiz') {
    const question = getCurrentQuestion();
    const categoryData = questionCategories[selectedCategory];

    return (
      <div className="quiz-container">
        <div className="quiz-container-wrapper">
          {/* Header */}
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
                <h3 className={`quiz-timer ${timeLeft <= 5 ? 'warning' : ''}`}>
                  {timeLeft}
                </h3>
              </div>
              <p className="quiz-score">النقاط: {score}</p>
            </div>
          </div>

          {/* Progress Bar */}
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
              </span>
            </div>

            {/* Question */}
            <h3 className="question-text">
              {question.question}
            </h3>

            {/* Options */}
            <div className="options-container">
              {question.options.map((option, index) => {
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
                    onClick={() => !showAnswer && handleAnswer(index)}
                    disabled={showAnswer}
                    className={buttonClass}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {showAnswer && (
              <div className="explanation-card">
                <h5 className="explanation-title">💡 التفسير:</h5>
                <p className="explanation-text">{question.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {showAnswer && (
              <div style={{textAlign: 'center'}}>
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
      </div>
    );
  }

  // Results Screen
  if (currentScreen === 'results') {
    const totalQuestions = questionCategories[selectedCategory].questions.length;
    const percentage = Math.round((score / (totalQuestions * 15)) * 100);
    
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
                  <h2 className="results-stat-number score">{score}/{totalQuestions*15}</h2>
                  <p className="results-stat-label">إجمالي النقاط</p>
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