import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrophyOutlined, 
  StarOutlined, 
  ClockCircleOutlined, 
  CrownOutlined, 
  AimOutlined, 
  SafetyCertificateOutlined,
  RightOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Button, Input, Progress, Card, Row, Col, Typography, Space, Badge, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const ProtectionCivileQuizGame = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerName, setPlayerName] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [badges, setBadges] = useState([]);

  const questionCategories = useMemo(() => ({
    'ثقافة عامة': {
      icon: '🔥',
      color: 'bg-red-500',
      questions: [
        { question: 'ما هو رقم الطوارئ للحماية المدنية في تونس؟', options: ['198', '199', '197', '911'], correct: 0, explanation: 'رقم 198 هو الرقم المخصص للاتصال بالحماية المدنية في تونس' },
        { question: 'متى تأسست النواة الأولى للحماية المدنية في تونس؟', options: ['1894', '1920', '1949', '1993'], correct: 0, explanation: 'تأسست في 1 نوفمبر 1894 تحت اسم جمعية التعاون للنجدة' },
        { question: 'ما هو شعار الحماية المدنية؟', options: ['وقاية نجدة إنقاذ', 'حماية وأمان', 'خدمة ووطنية', 'أمن وسلامة'], correct: 0, explanation: 'الشعار الرسمي هو: وقاية نجدة إنقاذ' },
        { question: 'كم عدد أفراد الحماية المدنية حاليا؟', options: ['5000', '6000', '7054', '8000'], correct: 2, explanation: 'العدد الحالي هو 7054 شخص' }
      ]
    },
    'مهام ومشمولات': {
      icon: '🚑', color: 'bg-blue-500', questions: [
        { question: 'من المهام الأساسية لعون الحماية المدنية:', options: ['حماية الأرواح والممتلكات', 'جمع الضرائب', 'التعليم', 'الزراعة'], correct: 0, explanation: 'حماية الأرواح والممتلكات هي المهمة الأساسية' },
        { question: 'متى يتدخل عون الحماية المدنية؟', options: ['في أوقات محددة فقط', 'في كل الأوقات والأماكن', 'في النهار فقط', 'عند الطلب المسبق'], correct: 1, explanation: 'عون الحماية المدنية مطالب بالتدخل في كل الأوقات والأماكن' },
        { question: 'أي من هذه ليس من مهام الحماية المدنية؟', options: ['إطفاء الحرائق', 'الإسعاف الطبي', 'حفظ الأمن العام', 'إنقاذ الغرقى'], correct: 2, explanation: 'حفظ الأمن العام من مهام الأمن الداخلي وليس الحماية المدنية' }
      ]
    },
    'رتب عسكرية': {
      icon: '🎖️', color: 'bg-yellow-500', questions: [
        { question: 'ما هي أعلى رتبة في الحماية المدنية؟', options: ['عقيد', 'عميد', 'مقدم', 'رائد'], correct: 1, explanation: 'العميد هو أعلى رتبة في الحماية المدنية' },
        { question: 'أي من هذه الرتب تأتي قبل النقيب؟', options: ['مالزم', 'رائد', 'مقدم', 'عقيد'], correct: 0, explanation: 'المالزم يأتي قبل النقيب في التسلسل الهرمي' },
        { question: 'من صنف الرقباء والأعوان:', options: ['نقيب', 'وكيل', 'مالزم', 'رائد'], correct: 1, explanation: 'الوكيل من صنف الرقباء والأعوان وليس من الضباط' }
      ]
    },
    'حقوق وواجبات': {
      icon: '⚖️', color: 'bg-green-500', questions: [
        { question: 'من واجبات المتطوع:', options: ['المحافظة على السر المهني', 'نشر المعلومات', 'انتقاد الرؤساء', 'العمل متى شاء'], correct: 0, explanation: 'المحافظة على السر المهني واجب أساسي' },
        { question: 'ما هو الحد الأدنى لسن المتطوع؟', options: ['18 سنة', '20 سنة', '21 سنة', '25 سنة'], correct: 1, explanation: 'الحد الأدنى هو 20 سنة وفق الفصل 3' },
        { question: 'من حقوق المتطوع:', options: ['التأمين على الحوادث', 'راتب شهري', 'سيارة خاصة', 'إجازة مدفوعة'], correct: 0, explanation: 'التأمين على الحوادث حق مضمون للمتطوعين' }
      ]
    },
    'أحداث من التاريخ': {
      icon: '📚', color: 'bg-purple-500', questions: [
        { question: 'ماذا حدث في لندن سنة 1666؟', options: ['زلزال كبير', 'حريق عظيم', 'فيضان', 'وباء'], correct: 1, explanation: 'حريق لندن العظيم سنة 1666 كان من الحرائق المسجلة في التاريخ' },
        { question: 'متى تم إحداث الديوان الوطني للحماية المدنية؟', options: ['1993', '1991', '1975', '1980'], correct: 0, explanation: 'صدر القانون عدد 121 لسنة 1993 لإحداث الديوان الوطني' },
        { question: 'من أسس المنظمة الدولية للحماية المدنية؟', options: ['هنري دونان', 'جورج سان بول', 'نابليون', 'شارل ديغول'], correct: 1, explanation: 'الطبيب الفرنسي جورج سان بول أسسها سنة 1931' }
      ]
    },
    'التطوع': {
      icon: '🤝', color: 'bg-indigo-500', questions: [
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

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <SafetyCertificateOutlined className="text-6xl text-red-400 ml-4" />
              <div>
                <Title level={1} className="text-white mb-2">لعبة الحماية المدنية</Title>
                <Text className="text-blue-200 text-lg">وقاية • نجدة • إنقاذ</Text>
              </div>
            </div>
          </div>

          {/* Player Name Input */}
          {!playerName && (
            <Card className="mb-6 bg-white/10 border-white/20" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Title level={3} className="text-white text-center mb-4">أدخل اسمك للبدء</Title>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="اسم المتطوع..."
                  className="flex-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <Button
                  type="primary"
                  danger
                  onClick={() => playerName && setPlayerName(playerName)}
                  disabled={!playerName}
                >
                  ابدأ
                </Button>
              </Space.Compact>
            </Card>
          )}

          {playerName && (
            <>
              {/* Welcome Message */}
              <Card className="mb-6 text-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                <Paragraph className="text-white text-lg mb-2">
                  مرحبا <Text strong className="text-green-300">{playerName}</Text>! 🎖️
                </Paragraph>
                <Text className="text-green-200">اختر فئة الأسئلة لتبدأ التحدي</Text>
              </Card>

              {/* Score Display */}
              <Row gutter={16} justify="center" className="mb-8">
                <Col>
                  <Card className="text-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <TrophyOutlined className="text-4xl text-yellow-400 mb-2" />
                    <Title level={2} className="text-white mb-1">{score}</Title>
                    <Text className="text-blue-200">النقاط</Text>
                  </Card>
                </Col>
                <Col>
                  <Card className="text-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    <CrownOutlined className="text-4xl text-purple-400 mb-2" />
                    <Title level={2} className="text-white mb-1">{badges.length}</Title>
                    <Text className="text-blue-200">الأوسمة</Text>
                  </Card>
                </Col>
              </Row>

              {/* Categories Grid */}
              <Row gutter={[16, 16]} className="mb-8">
                {Object.entries(questionCategories).map(([category, data]) => (
                  <Col xs={24} md={12} lg={8} key={category}>
                    <Card
                      hoverable
                      className={`${data.color} text-white h-full`}
                      onClick={() => startGame(category)}
                      style={{ 
                        backgroundColor: data.color === 'bg-red-500' ? '#ef4444' : 
                                        data.color === 'bg-blue-500' ? '#3b82f6' :
                                        data.color === 'bg-yellow-500' ? '#eab308' :
                                        data.color === 'bg-green-500' ? '#22c55e' :
                                        data.color === 'bg-purple-500' ? '#a855f7' : '#6366f1',
                        borderColor: 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{data.icon}</span>
                        <AimOutlined className="text-xl opacity-70" />
                      </div>
                      <Title level={4} className="text-white mb-2">{category}</Title>
                      <Text className="text-white opacity-80">{data.questions.length} سؤال</Text>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Badges Display */}
              {badges.length > 0 && (
                <Card 
                  title={<Title level={3} className="text-white text-center">🏆 الأوسمة المكتسبة</Title>}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <div className="flex flex-wrap justify-center gap-3">
                    {badges.map((badge, index) => (
                      <Badge key={index} count={<StarOutlined style={{ color: '#facc15' }} />}>
                        <Card size="small" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                          <Text className="text-yellow-300 font-bold">⭐ {badge}</Text>
                        </Card>
                      </Badge>
                    ))}
                  </div>
                </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-4" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Row justify="space-between" align="middle" className="mb-6">
            <Col>
              <Space>
                <span className="text-2xl">{categoryData.icon}</span>
                <div>
                  <Title level={4} className="text-white mb-0">{selectedCategory}</Title>
                  <Text className="text-blue-200">{playerName}</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <div className="text-left">
                <Space>
                  <ClockCircleOutlined />
                  <Title level={3} className={`text-white mb-0 ${timeLeft <= 5 ? 'text-red-400' : ''}`}>
                    {timeLeft}
                  </Title>
                </Space>
                <Text className="text-blue-200">النقاط: {score}</Text>
              </div>
            </Col>
          </Row>

          {/* Progress Bar */}
          <Progress 
            percent={((currentQuestionIndex + 1) / categoryData.questions.length) * 100}
            showInfo={false}
            strokeColor="#22c55e"
            trailColor="rgba(255,255,255,0.2)"
            className="mb-6"
          />

          <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            {/* Question Number */}
            <div className="text-center mb-4">
              <Badge 
                count={`السؤال ${currentQuestionIndex + 1} من ${categoryData.questions.length}`}
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              />
            </div>

            {/* Question */}
            <Title level={3} className="text-white mb-6 text-center">
              {question.question}
            </Title>

            {/* Options */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }} className="mb-6">
              {question.options.map((option, index) => {
                let buttonType = 'default';
                let danger = false;
                
                if (showAnswer) {
                  if (index === question.correct) {
                    buttonType = 'primary';
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    danger = true;
                  }
                }

                return (
                  <Button
                    key={index}
                    type={buttonType}
                    danger={danger}
                    size="large"
                    block
                    onClick={() => !showAnswer && handleAnswer(index)}
                    disabled={showAnswer}
                    className="text-right h-auto py-4"
                    style={{ 
                      backgroundColor: showAnswer 
                        ? (index === question.correct ? '#22c55e' : 
                           index === selectedAnswer && selectedAnswer !== question.correct ? '#ef4444' : 
                           'rgba(255,255,255,0.1)')
                        : 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white'
                    }}
                  >
                    <Text className="text-blue-200 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </Text>
                    {option}
                  </Button>
                );
              })}
            </Space>

            {/* Answer Explanation */}
            {showAnswer && (
              <Card 
                size="small" 
                className="mb-4"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)', borderColor: 'rgba(59, 130, 246, 0.4)' }}
              >
                <Title level={5} className="text-white mb-2">💡 التفسير:</Title>
                <Paragraph className="text-blue-100 mb-0">{question.explanation}</Paragraph>
              </Card>
            )}

            {/* Next Button */}
            {showAnswer && (
              <div className="text-center">
                <Button
                  type="primary"
                  size="large"
                  onClick={nextQuestion}
                  icon={<RightOutlined />}
                  style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                >
                  {currentQuestionIndex < categoryData.questions.length - 1 ? 'السؤال التالي' : 'عرض النتائج 🏆'}
                </Button>
              </div>
            )}
          </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-4 flex items-center" dir="rtl">
        <div className="max-w-2xl mx-auto w-full">
          <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="text-center">
              <div className="mb-6">
                <TrophyOutlined className="text-6xl text-yellow-400 mb-4" />
                <Title level={2} className="text-white mb-2">النتائج النهائية</Title>
                <Text className="text-blue-200">فئة: {selectedCategory}</Text>
              </div>

              <Card size="small" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }} className="mb-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={2} className="text-yellow-400 mb-1">{score}</Title>
                    <Text className="text-blue-200">إجمالي النقاط</Text>
                  </Col>
                  <Col span={12}>
                    <Title level={2} style={{ color: performanceColor }} className="mb-1">{percentage}%</Title>
                    <Text className="text-blue-200">نسبة النجاح</Text>
                  </Col>
                </Row>
                
                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <Title level={3} style={{ color: performanceColor }}>{performance}</Title>
              </Card>

              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => startGame(selectedCategory)}
                  style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                >
                  إعادة المحاولة
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={resetGame}
                  icon={<HomeOutlined />}
                  style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                >
                  العودة للرئيسية
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    );
  }
};

export default ProtectionCivileQuizGame;