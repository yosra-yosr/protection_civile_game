// 1. D'abord, créez le fichier utils/analytics.js
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// Initialiser Google Analytics
export const initGA = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
};

// Fonction générale pour tracker les événements
export const trackQuizEvent = (action, quizCategory, additionalData = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: 'Quiz',
      event_label: quizCategory,
      ...additionalData
    });
  }
};

// Fonctions spécifiques à votre quiz
export const trackPlayerRegistration = (playerName) => {
  trackQuizEvent('player_registration', 'General', {
    custom_player_name: playerName
  });
};

export const trackCategorySelection = (category) => {
  trackQuizEvent('category_selected', category);
};

export const trackQuizStart = (category, questionsCount) => {
  trackQuizEvent('quiz_start', category, {
    custom_questions_count: questionsCount,
    engagement_time_msec: Date.now()
  });
};

export const trackAnswer = (category, questionIndex, isCorrect, timeLeft, questionType = 'qcm') => {
  trackQuizEvent('question_answered', category, {
    custom_question_index: questionIndex + 1,
    custom_is_correct: isCorrect,
    custom_time_remaining: timeLeft,
    custom_question_type: questionType,
    value: isCorrect ? 1 : 0
  });
};

export const trackQuizComplete = (category, score, totalQuestions, correctAnswers, percentage) => {
  trackQuizEvent('quiz_complete', category, {
    custom_final_score: score,
    custom_total_questions: totalQuestions,
    custom_correct_answers: correctAnswers,
    custom_percentage: percentage,
    value: percentage
  });

  // Tracker la performance
  let performanceLevel = 'poor';
  if (percentage >= 80) performanceLevel = 'excellent';
  else if (percentage >= 60) performanceLevel = 'good';
  else if (percentage >= 40) performanceLevel = 'average';

  trackQuizEvent('quiz_performance', category, {
    custom_performance_level: performanceLevel,
    value: percentage
  });
};

export const trackQuizExit = (category, questionIndex, score) => {
  trackQuizEvent('quiz_exit', category, {
    custom_exit_at_question: questionIndex + 1,
    custom_score_at_exit: score
  });
};

export const trackBadgeEarned = (badgeName) => {
  trackQuizEvent('badge_earned', 'Achievements', {
    custom_badge_name: badgeName
  });
};