import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CrownOutlined, 
  AimOutlined, 
  RightOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';

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

  const questionCategories = useMemo(() => ({
    'ثقافة عامة': {
      icon: '🔥',
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      questions: [
        { question: 'ما هو رقم الطوارئ للحماية المدنية في تونس؟', options: ['198', '199', '197', '911'], correct: 0, explanation: 'رقم 198 هو الرقم المخصص للاتصال بالحماية المدنية في تونس' },
        { question: 'متى تأسست النواة الأولى للحماية المدنية في تونس؟', options: ['1894', '1920', '1949', '1993'], correct: 0, explanation: 'تأسست في 1 نوفمبر 1894 تحت اسم جمعية التعاون للنجدة' },
        { question: 'ما هو شعار الحماية المدنية؟', options: ['وقاية نجدة إنقاذ', 'حماية وأمان', 'خدمة ووطنية', 'أمن وسلامة'], correct: 0, explanation: 'الشعار الرسمي هو: وقاية نجدة إنقاذ' },
        { question: 'كم عدد أفراد الحماية المدنية حاليا؟', options: ['5000', '6000', '7054', '8000'], correct: 2, explanation: 'العدد الحالي هو 7054 شخص' }
      ]
    },
    'مهام ومشمولات': {
      icon: '🚑', 
      color: '#2563eb', 
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      questions: [
        { question: 'من المهام الأساسية لعون الحماية المدنية:', options: ['حماية الأرواح والممتلكات', 'جمع الضرائب', 'التعليم', 'الزراعة'], correct: 0, explanation: 'حماية الأرواح والممتلكات هي المهمة الأساسية' },
        { question: 'متى يتدخل عون الحماية المدنية؟', options: ['في أوقات محددة فقط', 'في كل الأوقات والأماكن', 'في النهار فقط', 'عند الطلب المسبق'], correct: 1, explanation: 'عون الحماية المدنية مطالب بالتدخل في كل الأوقات والأماكن' },
        { question: 'أي من هذه ليس من مهام الحماية المدنية؟', options: ['إطفاء الحرائق', 'الإسعاف الطبي', 'حفظ الأمن العام', 'إنقاذ الغرقى'], correct: 2, explanation: 'حفظ الأمن العام من مهام الأمن الداخلي وليس الحماية المدنية' }
      ]
    },
    'رتب عسكرية': {
      icon: '🎖️', 
      color: '#ca8a04', 
      gradient: 'linear-gradient(135deg, #ca8a04, #a16207)',
      questions: [
        { question: 'ما هي أعلى رتبة في الحماية المدنية؟', options: ['عقيد', 'عميد', 'مقدم', 'رائد'], correct: 1, explanation: 'العميد هو أعلى رتبة في الحماية المدنية' },
        { question: 'أي من هذه الرتب تأتي قبل النقيب؟', options: ['مالزم', 'رائد', 'مقدم', 'عقيد'], correct: 0, explanation: 'المالزم يأتي قبل النقيب في التسلسل الهرمي' },
        { question: 'من صنف الرقباء والأعوان:', options: ['نقيب', 'وكيل', 'مالزم', 'رائد'], correct: 1, explanation: 'الوكيل من صنف الرقباء والأعوان وليس من الضباط' }
      ]
    },
    'حقوق وواجبات': {
      icon: '⚖️', 
      color: '#16a34a', 
      gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
      questions: [
        { question: 'من واجبات المتطوع:', options: ['المحافظة على السر المهني', 'نشر المعلومات', 'انتقاد الرؤساء', 'العمل متى شاء'], correct: 0, explanation: 'المحافظة على السر المهني واجب أساسي' },
        { question: 'ما هو الحد الأدنى لسن المتطوع؟', options: ['18 سنة', '20 سنة', '21 سنة', '25 سنة'], correct: 1, explanation: 'الحد الأدنى هو 20 سنة وفق الفصل 3' },
        { question: 'من حقوق المتطوع:', options: ['التأمين على الحوادث', 'راتب شهري', 'سيارة خاصة', 'إجازة مدفوعة'], correct: 0, explanation: 'التأمين على الحوادث حق مضمون للمتطوعين' }
      ]
    },
    'أحداث من التاريخ': {
      icon: '📚', 
      color: '#9333ea', 
      gradient: 'linear-gradient(135deg, #9333ea, #7c3aed)',
      questions: [
        { question: 'ماذا حدث في لندن سنة 1666؟', options: ['زلزال كبير', 'حريق عظيم', 'فيضان', 'وباء'], correct: 1, explanation: 'حريق لندن العظيم سنة 1666 كان من الحرائق المسجلة في التاريخ' },
        { question: 'متى تم إحداث الديوان الوطني للحماية المدنية؟', options: ['1993', '1991', '1975', '1980'], correct: 0, explanation: 'صدر القانون عدد 121 لسنة 1993 لإحداث الديوان الوطني' },
        { question: 'من أسس المنظمة الدولية للحماية المدنية؟', options: ['هنري دونان', 'جورج سان بول', 'نابليون', 'شارل ديغول'], correct: 1, explanation: 'الطبيب الفرنسي جورج سان بول أسسها سنة 1931' }
      ]
    },
    'التطوع': {
      icon: '🤝', 
      color: '#4f46e5', 
      gradient: 'linear-gradient(135deg, #4f46e5, #4338ca)',
      questions: [
        { question: 'ما المقصود بالتطوع في الحماية المدنية؟', options: ['عمل مقابل أجر', 'عمل تلقائي بدون مقابل', 'عمل جزئي', 'عمل موسمي'], correct: 1, explanation: 'التطوع هو القيام تلقائيا وبدون مقابل بعمل إنساني (الفصل الأول)' },
        { question: 'كيف يتم استدعاء المتطوعين؟', options: ['بالهاتف فقط', 'بصفارة الإنذار فقط', 'بالهاتف أو صفارة إنذار', 'بالبريد'], correct: 2, explanation: 'الاستدعاء يكون بالاتصال المباشر أو صفارة إنذار خاصة (الفصل 10)' },
        { question: 'متى يمكن شطب المتطوع؟', options: ['عند المرض', 'عند السفر', 'عند ارتكاب مخالفة', 'عند تغيير العنوان'], correct: 2, explanation: 'يمكن الشطب عند ارتكاب مخالفة تمس بسير العمل (الفصل 9)' }
      ]
    }
  }), []);

  const getCurrentQuestion = useCallback(() => {
    if (!selectedCategory) return null;
    return questionCategories[selectedCategory].questions[currentQuestionIndex];
  }, [selectedCategory, currentQuestionIndex, questionCategories]);

  const handleAnswer = useCallback((answerIndex) => {
    const question = getCurrentQuestion();
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    if (question && answerIndex === question.correct) {
      const timeBonus = Math.floor(timeLeft / 3);
      const newScore = score + 10 + timeBonus;
      setScore(newScore);

      if (newScore >= 100 && !badges.includes('نجم مبتدئ')) {
        setBadges((prev) => [...prev, 'نجم مبتدئ']);
      }
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
      setTimeLeft(15);
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
    setTimeLeft(15);
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a, #312e81)',
      color: 'white',
      padding: '16px',
      direction: 'rtl',
      fontFamily: 'Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    headerFlex: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      margin: '8px 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    },
    subtitle: {
      color: '#bfdbfe',
      fontSize: '1.25rem',
      fontWeight: '500'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      fontSize: '1.125rem',
      outline: 'none'
    },
    button: {
      padding: '12px 24px',
      background: '#dc2626',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem'
    },
    buttonHover: {
      background: '#b91c1c'
    },
    welcomeCard: {
      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      textAlign: 'center'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '32px'
    },
    gridThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    categoryCard: {
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      transform: 'scale(1)',
      transition: 'all 0.3s',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    categoryCardHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
    },
    categoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    icon: {
      fontSize: '2.5rem',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    },
    categoryTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px'
    },
    progressBar: {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      height: '12px',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    progressFill: {
      background: '#22c55e',
      height: '100%',
      transition: 'width 0.3s',
      borderRadius: '12px'
    },
    questionCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    questionNumber: {
      textAlign: 'center',
      marginBottom: '24px'
    },
    badge: {
      background: '#2563eb',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    },
    questionText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '32px',
      textAlign: 'center',
      lineHeight: '1.6'
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px'
    },
    optionButton: {
      width: '100%',
      padding: '16px',
      textAlign: 'right',
      borderRadius: '12px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem'
    },
    optionButtonHover: {
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(1.02)'
    },
    correctAnswer: {
      background: '#16a34a',
      borderColor: '#15803d'
    },
    wrongAnswer: {
      background: '#dc2626',
      borderColor: '#b91c1c'
    },
    explanationCard: {
      background: 'rgba(37, 99, 235, 0.3)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      border: '1px solid rgba(37, 99, 235, 0.4)'
    },
    nextButton: {
      background: '#16a34a',
      color: 'white',
      fontWeight: 'bold',
      padding: '12px 32px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 auto',
      fontSize: '1rem'
    },
    resultsContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a, #312e81)',
      color: 'white',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      direction: 'rtl'
    },
    resultsCard: {
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px'
    },
    divider: {
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      margin: '16px 0'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center'
    },
    blueButton: {
      background: '#2563eb',
      color: 'white',
      fontWeight: 'bold',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem'
    },
    greenButton: {
      background: '#16a34a',
      color: 'white',
      fontWeight: 'bold',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1rem'
    }
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerFlex}>
              <img 
                src={`${process.env.PUBLIC_URL}/Écusson_protection_civile,_Tunisie.png`}
                alt="Description de l'image" 
                style={{
                    width: '100px',  // Largeur souhaitée
                    height: 'auto',   // Hauteur automatique pour conserver le ratio
                    marginLeft: '16px'
                }} 
            />
            
              <div>
                <h1 style={styles.title}>لعبة الحماية المدنية</h1>
                <p style={styles.subtitle}>وقاية • نجدة • إنقاذ</p>
              </div>
            </div>
          </div>

          {/* Player Name Input */}
          {!playerName && (
            <div style={styles.card}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '24px'}}>أدخل اسمك للبدء</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <input
                  type="text"
                  placeholder="اسم المتطوع..."
                  style={styles.input}
                  value={tempPlayerName}
                  onChange={(e) => setTempPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
                <button
                  onClick={handleNameSubmit}
                  disabled={!tempPlayerName.trim()}
                  style={{
                    ...styles.button,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: tempPlayerName.trim() ? 1 : 0.6,
                    cursor: tempPlayerName.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  <UserOutlined />
                  ابدأ
                </button>
              </div>
            </div>
          )}

          {playerName && (
            <>
              {/* Welcome Message */}
              <div style={styles.welcomeCard}>
                <p style={{fontSize: '1.25rem', marginBottom: '8px'}}>
                  مرحبا <span style={{fontWeight: 'bold', color: '#6ee7b7'}}>{playerName}</span>! 🎖️
                </p>
                <p style={{color: '#86efac'}}>اختر فئة الأسئلة لتبدأ التحدي</p>
              </div>

              {/* Score Display */}
              <div style={styles.gridTwo}>
                <div style={{...styles.card, textAlign: 'center'}}>
                  <TrophyOutlined style={{fontSize: '3rem', color: '#fbbf24', marginBottom: '12px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}} />
                  <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '4px 0'}}>{score}</h2>
                  <p style={{color: '#bfdbfe'}}>النقاط</p>
                </div>
                <div style={{...styles.card, textAlign: 'center'}}>
                  <CrownOutlined style={{fontSize: '3rem', color: '#c084fc', marginBottom: '12px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}} />
                  <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '4px 0'}}>{badges.length}</h2>
                  <p style={{color: '#bfdbfe'}}>الأوسمة</p>
                </div>
              </div>

              {/* Categories Grid */}
              <div style={styles.gridThree}>
                {Object.entries(questionCategories).map(([category, data]) => (
                  <div
                    key={category}
                    onClick={() => startGame(category)}
                    style={{
                      ...styles.categoryCard,
                      background: data.gradient
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <div style={styles.categoryHeader}>
                      <span style={styles.icon}>{data.icon}</span>
                      <AimOutlined style={{fontSize: '1.5rem', opacity: 0.7}} />
                    </div>
                    <h4 style={styles.categoryTitle}>{category}</h4>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{data.questions.length} سؤال</p>
                  </div>
                ))}
              </div>

              {/* Badges Display */}
              {badges.length > 0 && (
                <div style={styles.card}>
                  <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '16px'}}>🏆 الأوسمة المكتسبة</h3>
                  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px'}}>
                    {badges.map((badge, index) => (
                      <div key={index} style={{
                        background: 'rgba(234, 179, 8, 0.3)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(234, 179, 8, 0.3)'
                      }}>
                        <span style={{color: '#fde047', fontWeight: 'bold'}}>⭐ {badge}</span>
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
      <div style={styles.container}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={{fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>{categoryData.icon}</span>
              <div>
                <h4 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>{selectedCategory}</h4>
                <p style={{color: '#bfdbfe', margin: 0}}>{playerName}</p>
              </div>
            </div>
            <div style={{textAlign: 'left'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <ClockCircleOutlined />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  color: timeLeft <= 5 ? '#f87171' : 'white'
                }}>
                  {timeLeft}
                </h3>
              </div>
              <p style={{color: '#bfdbfe', margin: 0}}>النقاط: {score}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${((currentQuestionIndex + 1) / categoryData.questions.length) * 100}%`
              }}
            ></div>
          </div>

          <div style={styles.questionCard}>
            {/* Question Number */}
            <div style={styles.questionNumber}>
              <span style={styles.badge}>
                السؤال {currentQuestionIndex + 1} من {categoryData.questions.length}
              </span>
            </div>

            {/* Question */}
            <h3 style={styles.questionText}>
              {question.question}
            </h3>

            {/* Options */}
            <div style={styles.optionsContainer}>
              {question.options.map((option, index) => {
                let buttonStyle = {...styles.optionButton};
                
                if (showAnswer) {
                  if (index === question.correct) {
                    buttonStyle = {...buttonStyle, ...styles.correctAnswer};
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    buttonStyle = {...buttonStyle, ...styles.wrongAnswer};
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && handleAnswer(index)}
                    disabled={showAnswer}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      if (!showAnswer) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showAnswer) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <span style={{color: '#bfdbfe', marginLeft: '12px', fontWeight: 'bold'}}>
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {showAnswer && (
              <div style={styles.explanationCard}>
                <h5 style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>💡 التفسير:</h5>
                <p style={{color: '#bfdbfe', lineHeight: '1.6', margin: 0}}>{question.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {showAnswer && (
              <div style={{textAlign: 'center'}}>
                <button
                  onClick={nextQuestion}
                  style={styles.nextButton}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#16a34a';
                  }}
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
    let performanceColor = '';
    
    if (percentage >= 80) {
      performance = 'ممتاز! 🏆';
      performanceColor = '#22c55e';
    } else if (percentage >= 60) {
      performance = 'جيد جداً! 👍';
      performanceColor = '#3b82f6';
    } else if (percentage >= 40) {
      performance = 'جيد 📚';
      performanceColor = '#eab308';
    } else {
      performance = 'يحتاج تحسين 💪';
      performanceColor = '#ef4444';
    }

    return (
      <div style={styles.resultsContainer}>
        <div style={styles.resultsCard}>
          <div style={styles.card}>
            <div style={{textAlign: 'center'}}>
              <div style={{marginBottom: '32px'}}>
                <TrophyOutlined style={{fontSize: '5rem', color: '#fbbf24', marginBottom: '16px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}} />
                <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>النتائج النهائية</h2>
                <p style={{color: '#bfdbfe', fontSize: '1.125rem'}}>فئة: {selectedCategory}</p>
              </div>

              <div style={{...styles.card, marginBottom: '32px'}}>
                <div style={styles.resultsGrid}>
                  <div>
                    <h2 style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#fbbf24', margin: '4px 0'}}>{score}</h2>
                    <p style={{color: '#bfdbfe'}}>إجمالي النقاط</p>
                  </div>
                  <div>
                    <h2 style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '4px 0', color: performanceColor}}>{percentage}%</h2>
                    <p style={{color: '#bfdbfe'}}>نسبة النجاح</p>
                  </div>
                </div>
                
                <div style={styles.divider}></div>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: performanceColor, margin: 0}}>{performance}</h3>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={() => startGame(selectedCategory)}
                  style={styles.blueButton}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2563eb';
                  }}
                >
                  إعادة المحاولة
                </button>
                <button
                  onClick={resetGame}
                  style={styles.greenButton}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#16a34a';
                  }}
                >
                  <HomeOutlined />
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
export default ProtectionCivileQuizGame;