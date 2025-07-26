import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CrownOutlined, 
  AimOutlined, 
  RightOutlined,
  HomeOutlined,
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
    { 
      question: 'متى تأسست النواة الأولى للحماية المدنية في تونس؟', 
      options: ['1 نوفمبر 1894', '3 مارس 1949', '18 أكتوبر 1968', '27 ديسمبر 1993'], 
      correct: 0, 
      explanation: 'تأسست النواة الأولى للحماية المدنية في تونس في 1 نوفمبر 1894 تحت اسم جمعية التعاون للنجدة وصندوق التقاعد لرجال المطافئ المتطوعين' 
    },
    { 
      question: 'ماذا حدث في لندن سنة 1666؟', 
      options: ['زلزال كبير', 'حريق عظيم', 'فيضان', 'وباء'], 
      correct: 1, 
      explanation: 'حريق لندن العظيم سنة 1666 كان من الحرائق التاريخية المسجلة في العالم والتي أثرت على تطوير مفهوم الحماية المدنية' 
    },
    { 
      question: 'متى تم إحداث الديوان الوطني للحماية المدنية؟', 
      options: ['1993', '1991', '1975', '1980'], 
      correct: 0, 
      explanation: 'صدر القانون عدد 121 لسنة 1993 في 27 ديسمبر 1993 لإحداث الديوان الوطني للحماية المدنية' 
    },
    { 
      question: 'من أسس المنظمة الدولية للحماية المدنية؟', 
      options: ['هنري دونان', 'جورج سان بول', 'نابليون', 'شارل ديغول'], 
      correct: 1, 
      explanation: 'الطبيب الفرنسي جورج سان بول أسس جمعية مشارف جنيف سنة 1931 والتي انبثقت منها المنظمة الدولية للحماية المدنية' 
    },
    { 
      question: 'متى دخل دستور المنظمة الدولية للحماية المدنية حيز التنفيذ؟', 
      options: ['1958', '1966', '1972', '1949'], 
      correct: 2, 
      explanation: 'في فاتح مارس 1972 دخل دستور المنظمة الدولية للحماية المدنية حيز التنفيذ بعد مصادقة 18 دولة عضو' 
    },
    { 
      question: 'ما هو أول مقياس للحماية المدنية في التاريخ؟', 
      options: ['حريق لندن', 'الإمبراطورية الرومانية', 'الحرب العالمية الأولى', 'حريق سان فرانسيسكو'], 
      correct: 1, 
      explanation: 'أول مقاييس للحماية المدنية في العالم كانت في ظل الإمبراطورية الرومانية بعد حريق روما الشهير' 
    },
    { 
      question: 'متى تم إحداث مصلحة قومية للوقاية المدنية؟', 
      options: ['18 أكتوبر 1968', '4 مارس 1975', '20 مارس 1975', '28 ديسمبر 1978'], 
      correct: 0, 
      explanation: 'في 18 أكتوبر 1968، تم إحداث مصلحة قومية للوقاية المدنية وتم بعث مكاتب جهوية' 
    },
    { 
      question: 'متى أصبحت الحماية المدنية وكالة إدارية ذات صبغة مدنية واستقلالية مالية؟', 
      options: ['1975', '1978', '1980', '1991'], 
      correct: 1, 
      explanation: 'في 28 ديسمبر 1978 أصبحت وكالة إدارية ذات صبغة مدنية واستقلالية مالية' 
    }
  ]
},
'التطوع': {
 
  icon: '🤝', 
  color: '#4f46e5', 
  gradient: 'linear-gradient(135deg, #4f46e5, #4338ca)',
  questions: [
    { 
      question: 'الفصل الأول من الأمر عدد 2428 - في أي إطار يباشر العمل التطوعي؟', 
      options: ['إطار فردي', 'إطار الجمعيات الخيرية والإسعافية والاجتماعية', 'إطار حكومي', 'إطار تجاري'], 
      correct: 1, 
      explanation: 'الفصل الأول ينص على أن العمل التطوعي يباشر في إطار الجمعيات الخيرية والإسعافية والاجتماعية' 
    },
    { 
      question: 'الفصل 2 من الأمر عدد 2428 - من يتولى الإشراف على تنظيم العمل التطوعي؟', 
      options: ['وزارة الداخلية', 'الديوان الوطني للحماية المدنية', 'الجمعيات', 'الولايات'], 
      correct: 1, 
      explanation: 'الفصل 2 ينص على أن الديوان الوطني للحماية المدنية يتولى الإشراف على تنظيم العمل التطوعي' 
    },
    { 
      question: 'الفصل 3 من الأمر عدد 2428 - ما هي الشروط المطلوبة للترشح للتطوع؟', 
      options: ['العمر فقط', 'العمر والحقوق المدنية واللياقة البدنية والانخراط في جمعية', 'الشهادة العلمية فقط', 'الخبرة المهنية'], 
      correct: 1, 
      explanation: 'الفصل 3 يحدد شروط الترشح: العمر 20 سنة، التمتع بالحقوق المدنية وحسن السيرة، اللياقة البدنية، والانخراط في جمعية' 
    },
    { 
      question: 'الفصل 5 من الأمر عدد 2428 - من يقوم بفرز مطالب الترشح؟', 
      options: ['الجمعيات', 'المصالح المختصة للديوان الوطني للحماية المدنية', 'وزارة الداخلية', 'الولايات'], 
      correct: 1, 
      explanation: 'الفصل 5 ينص على أن فرز مطالب الترشح يقع من طرف المصالح المختصة للديوان الوطني للحماية المدنية' 
    },
    { 
      question: 'الفصل 7 من الأمر عدد 2428 - ماذا يجتاز المترشحون في المرحلة الأولى؟', 
      options: ['امتحان كتابي', 'اختبار نفساني فني', 'مقابلة شخصية', 'اختبار رياضي'], 
      correct: 1, 
      explanation: 'الفصل 7 ينص على أن المترشحين يجتازون في مرحلة أولى اختبارا نفسانيا فنيا ثم فترة تكوين أساسي وعام' 
    },
    { 
      question: 'الفصل 8 من الأمر عدد 2428 - ما هي شهادة المتطوع الناجح؟', 
      options: ['شهادة مشاركة', 'شهادة كفاءة في العمل التطوعي', 'شهادة خبرة', 'شهادة تقدير'], 
      correct: 1, 
      explanation: 'الفصل 8 ينص على تسليم شهادة كفاءة في العمل التطوعي للناجحين في الامتحان بعد التكوين' 
    },
    { 
      question: 'الفصل 11 من الأمر عدد 2428 - من يسلم التجهيزات للمتطوع؟', 
      options: ['الديوان الوطني', 'الجمعيات المنخرط بها المتطوع', 'وزارة الداخلية', 'المتطوع يشتريها بنفسه'], 
      correct: 1, 
      explanation: 'الفصل 11 ينص على أن الجمعيات المنخرط بها المتطوع تسلم التجهيزات الضرورية للمشاركة في عمليات الإنقاذ' 
    },
    { 
      question: 'الفصل 12 من الأمر عدد 2428 - من يمكنه تحمل أجرة ساعات تغيب المتطوع؟', 
      options: ['الحكومة', 'الجمعية', 'المؤسسات المشغلة للمتطوعين', 'المتطوع نفسه'], 
      correct: 2, 
      explanation: 'الفصل 12 ينص على أن المؤسسات المشغلة للمتطوعين يمكنها تحمل أجرة ساعات تغيبهم بسبب العمل التطوعي' 
    },
    { 
      question: 'القانون عدد 121 لسنة 1993 - متى صدر هذا القانون؟', 
      options: ['27 نوفمبر 1993', '27 ديسمبر 1993', '27 يناير 1993', '27 فبراير 1993'], 
      correct: 1, 
      explanation: 'القانون عدد 121 لسنة 1993 المتعلق بإحداث الديوان الوطني للحماية المدنية صدر في 27 ديسمبر 1993' 
    },
    { 
      question: 'القانون عدد 39 لسنة 1991 - ما علاقته بالحماية المدنية؟', 
      options: ['ينظم الرتب', 'يحدد تعريف الكارثة', 'ينظم التطوع', 'يحدد الميزانية'], 
      correct: 1, 
      explanation: 'القانون عدد 39 لسنة 1991 المؤرخ في 08 جوان 1991 يحدد مفهوم الكارثة المشار إليه في مهام الحماية المدنية' 
    }
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
 <div style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: window.innerWidth <= 768 ? '8px' : '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                <img 
                  src={`${process.env.PUBLIC_URL}/Écusson_protection_civile,_Tunisie.png`}
                  alt="Protection Civile Tunisie" 
                  style={{
                      width: window.innerWidth <= 768 ? '60px' : '80px',
                      height: 'auto',
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }} 
                />
              </div>
 if (currentScreen === 'home') {
    return (
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Enhanced Header with Gradient Background */}
          <div style={{
            ...styles.header,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            padding: window.innerWidth <= 768 ? '24px 20px' : '32px'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div style={styles.headerFlex}>
              <div style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: window.innerWidth <= 768 ? '12px' : '16px',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}>
                <img 
                  src={`${process.env.PUBLIC_URL}/Écusson_protection_civile,_Tunisie.png`}
                  alt="Protection Civile Tunisie" 
                  style={{
                      width: window.innerWidth <= 768 ? '70px' : '90px',
                      height: 'auto',
                      filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))'
                  }} 
                />
              </div>
              
              <div style={{flex: 1, textAlign: 'center', position: 'relative', zIndex: 2}}>
                <h1 style={{
                  ...styles.title,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                  marginBottom: '16px',
                  fontSize: window.innerWidth <= 768 ? '1.8rem' : window.innerWidth <= 480 ? '1.5rem' : '2.5rem',
                  fontWeight: '800',
                  lineHeight: '1.2'
                }}>لعبة التطوع في خدمة الحماية المدنية</h1>
                
                {/* Enhanced Professional Slogan */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '20px',
                  padding: window.innerWidth <= 768 ? '16px 24px' : '20px 32px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                  marginTop: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle background decoration */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%)',
                    opacity: 0.7
                  }}></div>
                  
                  <p style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.6rem',
                    fontWeight: '700',
                    letterSpacing: window.innerWidth <= 768 ? '3px' : '4px',
                    textAlign: 'center',
                    margin: '0',
                    position: 'relative',
                    zIndex: 1,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>وقاية • نجدة • إنقاذ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Player Name Input */}
          {!playerName && (
            <div style={{
              ...styles.card,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px'
            }}>
              {/* Decorative background pattern */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                opacity: 0.7
              }}></div>
              
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
              
              <div style={{
                display: 'flex', 
                gap: '16px', 
                alignItems: 'stretch', 
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                position: 'relative',
                zIndex: 1
              }}>
                <input
                  type="text"
                  placeholder="اسم المتطوع..."
                  style={{
                    ...styles.input,
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: window.innerWidth <= 768 ? '16px 20px' : '18px 24px',
                    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    width: window.innerWidth <= 768 ? '100%' : 'auto'
                  }}
                  value={tempPlayerName}
                  onChange={(e) => setTempPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                    e.target.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.4)';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                <button
                  onClick={handleNameSubmit}
                  disabled={!tempPlayerName.trim()}
                  style={{
                    background: tempPlayerName.trim() 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                      : 'rgba(107, 114, 128, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: window.innerWidth <= 768 ? '16px 24px' : '18px 28px',
                    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem',
                    fontWeight: 'bold',
                    cursor: tempPlayerName.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    boxShadow: tempPlayerName.trim() 
                      ? '0 8px 20px rgba(59, 130, 246, 0.4)' 
                      : 'none',
                    transform: 'scale(1)',
                    minWidth: window.innerWidth <= 768 ? '100%' : '120px',
                    width: window.innerWidth <= 768 ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (tempPlayerName.trim()) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = tempPlayerName.trim() 
                      ? '0 8px 20px rgba(59, 130, 246, 0.4)' 
                      : 'none';
                  }}
                >
                  ابدأ
                </button>
              </div>
            </div>
          )}

          {playerName && (
            <>
              {/* Enhanced Welcome Message */}
              <div style={{
                ...styles.welcomeCard,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '24px',
                padding: window.innerWidth <= 768 ? '20px' : '28px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle background decoration */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                  opacity: 0.6
                }}></div>
                
                <p style={{
                  fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.6rem', 
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  مرحبا <span style={{
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: window.innerWidth <= 768 ? '1.4rem' : '1.7rem'
                  }}>{playerName}</span>! 🎖️
                </p>
                <p style={{
                  color: '#86efac',
                  fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem',
                  fontWeight: '500',
                  position: 'relative',
                  zIndex: 1
                }}>اختر فئة الأسئلة لتبدأ التحدي</p>
              </div>

              {/* Enhanced Score Display */}
              <div style={{
                ...styles.gridTwo,
                display: 'grid',
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
                gap: window.innerWidth <= 768 ? '20px' : '28px'
              }}>
                <div style={{
                  ...styles.card, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  padding: window.innerWidth <= 768 ? '24px' : '28px'
                }}>
                  {/* Background decoration */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '60px',
                    height: '60px',
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                  }}></div>
                  
                  <TrophyOutlined style={{
                    fontSize: window.innerWidth <= 768 ? '3rem' : '4rem', 
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px',
                    filter: 'drop-shadow(0 6px 12px rgba(251, 191, 36, 0.5))',
                    position: 'relative',
                    zIndex: 1
                  }} />
                  <h2 style={{
                    fontSize: window.innerWidth <= 768 ? '2.2rem' : '2.8rem', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '12px 0',
                    position: 'relative',
                    zIndex: 1
                  }}>{score}</h2>
                  <p style={{
                    color: '#bfdbfe', 
                    fontWeight: '600', 
                    position: 'relative', 
                    zIndex: 1,
                    fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
                  }}>النقاط</p>
                </div>
                
                <div style={{
                  ...styles.card, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  padding: window.innerWidth <= 768 ? '24px' : '28px'
                }}>
                  {/* Background decoration */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    width: '60px',
                    height: '60px',
                    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                  }}></div>
                  
                  <CrownOutlined style={{
                    fontSize: window.innerWidth <= 768 ? '3rem' : '4rem', 
                    background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px',
                    filter: 'drop-shadow(0 6px 12px rgba(192, 132, 252, 0.5))',
                    position: 'relative',
                    zIndex: 1
                  }} />
                  <h2 style={{
                    fontSize: window.innerWidth <= 768 ? '2.2rem' : '2.8rem', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '12px 0',
                    position: 'relative',
                    zIndex: 1
                  }}>{badges.length}</h2>
                  <p style={{
                    color: '#bfdbfe', 
                    fontWeight: '600', 
                    position: 'relative', 
                    zIndex: 1,
                    fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
                  }}>الأوسمة</p>
                </div>
              </div>

              {/* Enhanced Categories Grid */}
              <div style={{
                ...styles.gridThree,
                display: 'grid',
                gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: window.innerWidth <= 768 ? '20px' : '28px'
              }}>
                {Object.entries(questionCategories).map(([category, data]) => (
                  <div
                    key={category}
                    onClick={() => startGame(category)}
                    style={{
                      ...styles.categoryCard,
                      background: data.gradient,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(15px)',
                      padding: window.innerWidth <= 768 ? '20px' : '24px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 28px 56px rgba(0, 0, 0, 0.4), 0 0 35px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      width: '80px',
                      height: '80px',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%'
                    }}></div>
                    
                    <div style={{
                      ...styles.categoryHeader,
                      position: 'relative',
                      zIndex: 1,
                      marginBottom: '20px'
                    }}>
                      <span style={{
                        ...styles.icon,
                        fontSize: window.innerWidth <= 768 ? '2.2rem' : '2.8rem',
                        filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))'
                      }}>{data.icon}</span>
                      <AimOutlined style={{
                        fontSize: window.innerWidth <= 768 ? '1.6rem' : '2rem', 
                        opacity: 0.8,
                        color: 'rgba(255, 255, 255, 0.9)'
                      }} />
                    </div>
                    
                    <h4 style={{
                      ...styles.categoryTitle,
                      fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.4rem',
                      fontWeight: 'bold',
                      color: 'white',
                      textShadow: '0 3px 6px rgba(0, 0, 0, 0.5)',
                      marginBottom: '12px',
                      position: 'relative',
                      zIndex: 1
                    }}>{category}</h4>
                    
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '500',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
                    }}>{data.questions.length} سؤال</p>
                  </div>
                ))}
              </div>

              {/* Enhanced Badges Display */}
              {badges.length > 0 && (
                <div style={{
                  ...styles.card,
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  padding: window.innerWidth <= 768 ? '24px' : '28px'
                }}>
                  {/* Background decoration */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'radial-gradient(circle at 70% 30%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)',
                    opacity: 0.7
                  }}></div>
                  
                  <h3 style={{
                    fontSize: window.innerWidth <= 768 ? '1.6rem' : '2rem', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center', 
                    marginBottom: '24px',
                    position: 'relative',
                    zIndex: 1
                  }}>🏆 الأوسمة المكتسبة</h3>
                  
                  <div style={{
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: window.innerWidth <= 768 ? '16px' : '20px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {badges.map((badge, index) => (
                      <div key={index} style={{
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)',
                        backdropFilter: 'blur(15px)',
                        borderRadius: '20px',
                        padding: window.innerWidth <= 768 ? '14px 20px' : '18px 24px',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        boxShadow: '0 10px 25px rgba(234, 179, 8, 0.25)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.08)';
                        e.target.style.boxShadow = '0 15px 30px rgba(234, 179, 8, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 10px 25px rgba(234, 179, 8, 0.25)';
                      }}
                      >
                        <span style={{
                          background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 'bold',
                          fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem'
                        }}>⭐ {badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced CSS with better responsive design */}
        <style jsx>{`
          * {
            box-sizing: border-box;
          }
          
          /* Subtle hover animations for slogan words */
          div:hover {
            animation: subtle-glow 0.3s ease;
          }
          
          @keyframes subtle-glow {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.1); }
            100% { filter: brightness(1); }
          }
          
          /* Enhanced responsive design */
          @media (max-width: 768px) {
            .container {
              padding: 16px;
            }
            
            /* Adjust slogan layout for mobile */
            .slogan-container {
              flex-direction: column;
              gap: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            .container {
              padding: 12px;
            }
            
            /* Stack slogan vertically on very small screens */
            .slogan-container {
              flex-direction: column;
              align-items: center;
              gap: 8px !important;
            }
          }
          
          /* Smooth transitions for all interactive elements */
          input, button, div[style*="cursor: pointer"] {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          /* Enhanced focus styles for accessibility */
          input:focus {
            outline: 2px solid rgba(59, 130, 246, 0.5);
            outline-offset: 2px;
          }
          
          button:focus {
            outline: 2px solid rgba(59, 130, 246, 0.5);
            outline-offset: 2px;
          }
        `}</style>
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