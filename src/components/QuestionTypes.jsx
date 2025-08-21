import { useState, useEffect} from 'react';
import { CheckOutlined, CloseOutlined, DragOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// Composant True/False Question
export const TrueFalseQuestion = ({ question, onAnswer, showAnswer, isQuestionAnswered, userAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer);

  useEffect(() => {
    setSelectedAnswer(userAnswer);
  }, [userAnswer, question.question]);

  const handleAnswer = (answer) => {
    if (showAnswer || isQuestionAnswered) return;
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  return (
    <div className="true-false-container">
      <h3 className="question-text-optimized">{question.question}</h3>
      
      <div className="true-false-options">
        {[true, false].map((option, index) => {
          const isTrue = option === true;
          let buttonClass = `true-false-button ${isTrue ? 'true-btn' : 'false-btn'}`;
          
          if (showAnswer) {
            if (option === question.correct) {
              buttonClass += ' correct';
            } else if (selectedAnswer === option && selectedAnswer !== question.correct) {
              buttonClass += ' wrong';
            }
          } else if (selectedAnswer === option) {
            buttonClass += ' selected';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showAnswer || isQuestionAnswered}
              className={buttonClass}
            >
              <div className="true-false-icon">
                {isTrue ? <CheckOutlined /> : <CloseOutlined />}
              </div>
              <span className="true-false-text">
                {isTrue ? 'صحيح' : 'خطأ'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Composant Drag Drop Timeline - CORRIGÉ
export const DragDropTimeline = ({ question, onAnswer, showAnswer, isQuestionAnswered, userAnswers }) => {
  const [draggedItems, setDraggedItems] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [, setIsCorrect] = useState(false);

  // Réinitialiser complètement à chaque nouvelle question
  useEffect(() => {
    if (userAnswers && userAnswers.length > 0) {
      setTimelineItems(userAnswers);
      const usedIds = userAnswers.map(item => item?.id).filter(Boolean);
      const remaining = question.items.filter(item => !usedIds.includes(item.id));
      setDraggedItems(remaining);
    } else {
      // Réinitialisation complète pour nouvelle question
      const shuffled = [...question.items].sort(() => Math.random() - 0.5);
      setDraggedItems(shuffled);
      setTimelineItems(new Array(question.items.length).fill(null));
      setIsCorrect(false);
    }
  }, [question.question, question.items, userAnswers]); // Ajouter question.question comme dépendance

  const handleDragStart = (e, item) => {
    if (showAnswer || isQuestionAnswered) return;
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    if (showAnswer || isQuestionAnswered) return;
    e.preventDefault();
    
    try {
      const item = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      const newTimeline = [...timelineItems];
      // Si la case est déjà remplie, remettre l'ancien item dans les disponibles
      if (newTimeline[index]) {
        setDraggedItems(prev => [...prev, newTimeline[index]]);
      }
      
      newTimeline[index] = item;
      setTimelineItems(newTimeline);
      
      const newDraggedItems = draggedItems.filter(i => i.id !== item.id);
      setDraggedItems(newDraggedItems);

      // Auto-submit si tous les éléments sont placés
      if (newTimeline.every(item => item !== null)) {
        setTimeout(() => {
          onAnswer(newTimeline);
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
  };

  const removeFromTimeline = (index) => {
    if (showAnswer || isQuestionAnswered) return;
    const item = timelineItems[index];
    if (item) {
      const newTimeline = [...timelineItems];
      newTimeline[index] = null;
      setTimelineItems(newTimeline);
      setDraggedItems(prev => [...prev, item]);
    }
  };

  // Gestion du timeout - soumettre automatiquement même si incomplet
  useEffect(() => {
    if (showAnswer && !isQuestionAnswered && timelineItems.some(item => item === null)) {
      // Si le temps est écoulé mais la réponse est incomplète, soumettre quand même
      onAnswer(timelineItems);
    }
  }, [showAnswer, isQuestionAnswered, timelineItems, onAnswer]);

  return (
    <div className="drag-drop-timeline-container">
      <h3 className="question-text-optimized">{question.question}</h3>
      
      <div className="timeline-workspace">
        <div className="draggable-items">
          <h4>العناصر المتاحة:</h4>
          <div className="items-pool">
            {draggedItems.map((item) => (
              <div
                key={`draggable-${item.id}`}
                draggable={!showAnswer && !isQuestionAnswered}
                onDragStart={(e) => handleDragStart(e, item)}
                className="draggable-item"
                style={{
                  cursor: (!showAnswer && !isQuestionAnswered) ? 'grab' : 'default',
                  opacity: (!showAnswer && !isQuestionAnswered) ? 1 : 0.6
                }}
              >
                <DragOutlined className="drag-icon" />
                <div className="item-content">
                  <span className="item-text">{item.text}</span>
                  <small className="item-date">({item.date || item.year})</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline-container">
          <h4>الخط الزمني:</h4>
          <div className="timeline">
            {timelineItems.map((item, index) => (
              <div
                key={`timeline-${index}`}
                className={`timeline-slot ${item ? 'filled' : 'empty'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  minHeight: '80px',
                  border: item ? '2px solid #6b7280' : '2px dashed #cbd5e1'
                }}
              >
                <div className="timeline-number">{index + 1}</div>
                {item ? (
                  <div className={`timeline-item ${showAnswer ? (item.order === index + 1 ? 'correct' : 'wrong') : ''}`}>
                    <span className="timeline-text">{item.text}</span>
                    <small className="timeline-date">({item.date || item.year})</small>
                    {!showAnswer && !isQuestionAnswered && (
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromTimeline(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-slot" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    اسحب عنصراً هنا
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAnswer && (
        <div className="timeline-results" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ color: '#0369a1', marginBottom: '10px' }}>النتيجة:</h4>
          {question.items.map((correctItem, index) => {
            const userItem = timelineItems[index];
            const isCorrect = userItem && userItem.id === correctItem.id;
            return (
              <div key={correctItem.id} style={{ 
                margin: '5px 0',
                color: isCorrect ? '#16a34a' : '#dc2626'
              }}>
                <strong>الموضع {index + 1}:</strong> 
                <span style={{ marginLeft: '10px' }}>
                  {userItem ? userItem.text : 'فارغ'} 
                  {isCorrect ? ' ✓' : ` ✗ (الصحيح: ${correctItem.text})`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Composant Match Arrows
export const MatchArrows = ({ question, onAnswer, showAnswer, isQuestionAnswered, userMatches }) => {
  const [matches, setMatches] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  useEffect(() => {
    if (userMatches && userMatches.length > 0) {
      setMatches(userMatches);
    } else {
      setMatches([]);
      setSelectedLeft(null);
    }
  }, [userMatches, question.question]);

  const handleLeftClick = (leftItem) => {
    if (showAnswer || isQuestionAnswered) return;
    setSelectedLeft(leftItem);
  };

  const handleRightClick = (rightItem) => {
    if (showAnswer || isQuestionAnswered || !selectedLeft) return;
    
    const newMatches = matches.filter(m => m.left !== selectedLeft.id);
    newMatches.push({ left: selectedLeft.id, right: rightItem.id });
    
    setMatches(newMatches);
    setSelectedLeft(null);
    
    if (newMatches.length === question.leftColumn.length) {
      onAnswer(newMatches);
    }
  };

  const getMatchForLeft = (leftId) => {
    return matches.find(m => m.left === leftId);
  };

  const getMatchForRight = (rightId) => {
    return matches.find(m => m.right === rightId);
  };

  const isCorrectMatch = (leftId, rightId) => {
    return question.correctMatches.some(m => m.left === leftId && m.right === rightId);
  };

  const getRightItemForLeft = (leftId) => {
    const match = getMatchForLeft(leftId);
    return match ? question.rightColumn.find(r => r.id === match.right) : null;
  };

  // Gestion du timeout
  useEffect(() => {
    if (showAnswer && !isQuestionAnswered && matches.length < question.leftColumn.length) {
      onAnswer(matches);
    }
  }, [showAnswer, isQuestionAnswered, matches, question.leftColumn.length, onAnswer]);

  return (
    <div className="match-arrows-container">
      <h3 className="question-text-optimized">{question.question}</h3>
      
      <div className="match-workspace">
        <div className="left-column">
          <h4>العمود الأول</h4>
          {question.leftColumn.map((item) => {
            const match = getMatchForLeft(item.id);
            const isSelected = selectedLeft?.id === item.id;
            let itemClass = `match-item left-item ${isSelected ? 'selected' : ''}`;
            
            if (showAnswer && match) {
              itemClass += isCorrectMatch(item.id, match.right) ? ' correct' : ' wrong';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleLeftClick(item)}
                className={itemClass}
              >
                <span>{item.text}</span>
                {match && (
                  <div className="connection-info">
                    <span className="arrow">→</span>
                    <span className="connected-text">{getRightItemForLeft(item.id)?.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="arrows-zone">
          <div className="arrows-display">
            {matches.map((match, index) => {
              const correct = showAnswer && isCorrectMatch(match.left, match.right);
              
              return (
                <div
                  key={index}
                  className={`match-arrow ${showAnswer ? (correct ? 'correct' : 'wrong') : ''}`}
                >
                  {showAnswer ? (
                    correct ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                  ) : (
                    <span className="arrow-symbol">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-column">
          <h4>العمود الثاني</h4>
          {question.rightColumn.map((item) => {
            const match = getMatchForRight(item.id);
            let itemClass = `match-item right-item`;
            
            if (showAnswer && match) {
              itemClass += isCorrectMatch(match.left, item.id) ? ' correct' : ' wrong';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleRightClick(item)}
                className={itemClass}
              >
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLeft && !showAnswer && !isQuestionAnswered && (
        <div className="match-instruction">
          انقر على العنصر المقابل لـ: <strong>{selectedLeft.text}</strong>
        </div>
      )}
    </div>
  );
};

// Composant Multiple Checkbox
export const MultipleCheckbox = ({ question, onAnswer, showAnswer, isQuestionAnswered, userAnswers }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (userAnswers && Array.isArray(userAnswers)) {
      setSelectedOptions(userAnswers);
    } else {
      setSelectedOptions([]);
    }
  }, [userAnswers, question.question]);

  const handleOptionToggle = (optionId) => {
    if (showAnswer || isQuestionAnswered) return;
    
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    
    setSelectedOptions(newSelected);
  };

  const handleSubmit = () => {
    onAnswer(selectedOptions);
  };

  const getOptionStatus = (option) => {
    const isSelected = selectedOptions.includes(option.id);
    
    if (!showAnswer) return isSelected ? 'selected' : '';
    
    if (option.correct && isSelected) return 'correct';
    if (!option.correct && isSelected) return 'wrong';
    if (option.correct && !isSelected) return 'missed';
    return '';
  };

  // Gestion du timeout
  useEffect(() => {
    if (showAnswer && !isQuestionAnswered) {
      onAnswer(selectedOptions);
    }
  }, [showAnswer, isQuestionAnswered, selectedOptions, onAnswer]);

  return (
    <div className="multiple-checkbox-container">
      <h3 className="question-text-optimized">{question.question}</h3>
      
      <div className="checkbox-options">
        {question.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const status = getOptionStatus(option);
          
          return (
            <div
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`checkbox-option ${status}`}
            >
              <div className="checkbox-indicator">
                {isSelected ? (
                  <div className="checkbox-checked">
                    <CheckOutlined />
                  </div>
                ) : (
                  <div className="checkbox-empty"></div>
                )}
              </div>
              <span className="checkbox-text">{option.text}</span>
              {showAnswer && option.correct && (
                <div className="correct-indicator">
                  <CheckCircleOutlined />
                </div>
              )}
              {showAnswer && !option.correct && isSelected && (
                <div className="wrong-indicator">
                  <CloseCircleOutlined />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedOptions.length > 0 && !showAnswer && !isQuestionAnswered && (
        <div className="checkbox-actions">
          <button onClick={handleSubmit} className="submit-multiple-btn">
            تأكيد الاختيار ({selectedOptions.length} عنصر مختار)
          </button>
          <button 
            onClick={() => setSelectedOptions([])} 
            className="clear-selection-btn"
          >
            مسح الكل
          </button>
        </div>
      )}
    </div>
  );
};

// Composant Reorder - CORRIGÉ
export const ReorderQuestion = ({ question, onAnswer, showAnswer, isQuestionAnswered, userOrder }) => {
  const [orderedItems, setOrderedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    if (userOrder && userOrder.length > 0) {
      setOrderedItems(userOrder);
      const usedIds = userOrder.map(item => item?.id).filter(Boolean);
      const remaining = question.items.filter(item => !usedIds.includes(item.id));
      setAvailableItems(remaining);
    } else {
      const shuffled = [...question.items].sort(() => Math.random() - 0.5);
      setAvailableItems(shuffled);
      setOrderedItems(new Array(question.items.length).fill(null));
    }
  }, [question.question, question.items, userOrder]); // Ajouter question.question

  const handleDragStart = (e, item) => {
    if (showAnswer || isQuestionAnswered) return;
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    if (showAnswer || isQuestionAnswered) return;
    e.preventDefault();
    
    try {
      const item = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      const newOrdered = [...orderedItems];
      // Si la case est déjà remplie, remettre l'ancien item dans les disponibles
      if (newOrdered[targetIndex]) {
        setAvailableItems(prev => [...prev, newOrdered[targetIndex]]);
      }
      
      newOrdered[targetIndex] = item;
      setOrderedItems(newOrdered);
      
      const newAvailable = availableItems.filter(i => i.id !== item.id);
      setAvailableItems(newAvailable);

      // Auto-submit si tous les éléments sont placés
      if (newOrdered.every(item => item !== null)) {
        setTimeout(() => {
          onAnswer(newOrdered);
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const removeFromOrder = (index) => {
    if (showAnswer || isQuestionAnswered) return;
    const item = orderedItems[index];
    if (item) {
      const newOrdered = [...orderedItems];
      newOrdered[index] = null;
      setOrderedItems(newOrdered);
      setAvailableItems(prev => [...prev, item]);
    }
  };

  const isItemCorrect = (item, index) => {
    return item && item.order === index + 1;
  };

  // Gestion du timeout
  useEffect(() => {
    if (showAnswer && !isQuestionAnswered) {
      onAnswer(orderedItems);
    }
  }, [showAnswer, isQuestionAnswered, orderedItems, onAnswer]);

  return (
    <div className="reorder-container">
      <h3 className="question-text-optimized">{question.question}</h3>
      
      <div className="reorder-workspace">
        <div className="available-items">
          <h4>العناصر المتاحة:</h4>
          <div className="items-pool">
            {availableItems.map((item) => (
              <div
                key={`available-${item.id}`}
                draggable={!showAnswer && !isQuestionAnswered}
                onDragStart={(e) => handleDragStart(e, item)}
                className="reorder-item draggable"
                style={{
                  cursor: (!showAnswer && !isQuestionAnswered) ? 'grab' : 'default',
                  opacity: (!showAnswer && !isQuestionAnswered) ? 1 : 0.6
                }}
              >
                <DragOutlined className="drag-icon" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ordered-list">
          <h4>الترتيب الصحيح:</h4>
          <div className="order-slots">
            {orderedItems.map((item, index) => (
              <div
                key={`slot-${index}`}
                className={`order-slot ${item ? 'filled' : 'empty'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  minHeight: '60px',
                  border: item ? '2px solid #6b7280' : '2px dashed #cbd5e1'
                }}
              >
                <div className="slot-number">{index + 1}</div>
                {item ? (
                  <div className={`ordered-item ${showAnswer ? (isItemCorrect(item, index) ? 'correct' : 'wrong') : ''}`}>
                    <span>{item.text}</span>
                    {!showAnswer && !isQuestionAnswered && (
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromOrder(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    )}
                    {showAnswer && (
                      <div className="order-indicator">
                        {isItemCorrect(item, index) ? <CheckOutlined /> : <CloseOutlined />}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-slot" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    اسحب عنصراً هنا
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Fill in Blanks - CORRIGÉ
export const FillInBlanksQuestion = ({ question, onAnswer, showAnswer, isQuestionAnswered, userAnswers }) => {
  const [draggedWord, setDraggedWord] = useState(null);
  const [droppedWords, setDroppedWords] = useState({});
  const [availableWords, setAvailableWords] = useState([]);

  // Réinitialiser complètement à chaque nouvelle question
  useEffect(() => {
    if (userAnswers && Object.keys(userAnswers).length > 0) {
      setDroppedWords(userAnswers);
      const usedWords = Object.values(userAnswers);
      setAvailableWords(question.words.filter(word => !usedWords.includes(word)));
    } else {
      // Réinitialisation complète pour nouvelle question
      setDroppedWords({});
      setAvailableWords([...question.words]);
      setDraggedWord(null);
    }
  }, [userAnswers, question.words, question.question]); // Ajouter question.question

  const handleDragStart = (e, word) => {
    if (showAnswer || isQuestionAnswered) return;
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, blankId) => {
    e.preventDefault();
    
    if (!draggedWord || showAnswer || isQuestionAnswered) return;

    const newDroppedWords = { ...droppedWords };
    const newAvailableWords = [...availableWords];

    // Si il y a déjà un mot dans cette case, le remettre dans les mots disponibles
    if (newDroppedWords[blankId]) {
      newAvailableWords.push(newDroppedWords[blankId]);
    }

    // Placer le nouveau mot
    newDroppedWords[blankId] = draggedWord;
    
    // Retirer le mot de la liste disponible
    const wordIndex = newAvailableWords.indexOf(draggedWord);
    if (wordIndex > -1) {
      newAvailableWords.splice(wordIndex, 1);
    }

    setDroppedWords(newDroppedWords);
    setAvailableWords(newAvailableWords);
    setDraggedWord(null);

    // Vérifier si toutes les cases sont remplies
    if (Object.keys(newDroppedWords).length === question.blanks.length) {
      setTimeout(() => {
        onAnswer(newDroppedWords);
      }, 100);
    }
  };

  const removeWordFromBlank = (blankId) => {
    if (showAnswer || isQuestionAnswered) return;

    const word = droppedWords[blankId];
    if (word) {
      const newDroppedWords = { ...droppedWords };
      delete newDroppedWords[blankId];
      
      const newAvailableWords = [...availableWords, word];
      
      setDroppedWords(newDroppedWords);
      setAvailableWords(newAvailableWords);
    }
  };

  // Gestion du timeout
  useEffect(() => {
    if (showAnswer && !isQuestionAnswered) {
      onAnswer(droppedWords);
    }
  }, [showAnswer, isQuestionAnswered, droppedWords, onAnswer]);

  const renderParagraphWithBlanks = () => {
    let paragraphParts = question.paragraph.split('_____');
    let result = [];

    paragraphParts.forEach((part, index) => {
      result.push(<span key={`text-${index}`}>{part}</span>);
      
      if (index < paragraphParts.length - 1) {
        const blankId = index;
        const isCorrect = showAnswer && droppedWords[blankId] === question.blanks[blankId].correctAnswer;
        const isWrong = showAnswer && droppedWords[blankId] && droppedWords[blankId] !== question.blanks[blankId].correctAnswer;
        
        result.push(
          <span
            key={`blank-${blankId}`}
            className={`fill-blank ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${!droppedWords[blankId] ? 'empty' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, blankId)}
            onClick={() => removeWordFromBlank(blankId)}
            data-blank-id={blankId}
            style={{
              display: 'inline-block',
              minWidth: '120px',
              minHeight: '35px',
              border: '2px dashed #ccc',
              borderRadius: '8px',
              margin: '0 5px',
              padding: '5px 10px',
              textAlign: 'center',
              backgroundColor: isCorrect ? '#dcfce7' : isWrong ? '#fef2f2' : droppedWords[blankId] ? '#f3f4f6' : '#f9fafb',
              borderColor: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : droppedWords[blankId] ? '#6b7280' : '#d1d5db',
              cursor: droppedWords[blankId] && !showAnswer ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            title={droppedWords[blankId] && !showAnswer ? 'انقر لإزالة الكلمة' : ''}
          >
            {showAnswer && !droppedWords[blankId] ? (
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                {question.blanks[blankId].correctAnswer}
              </span>
            ) : (
              droppedWords[blankId] || ''
            )}
          </span>
        );
      }
    });

    return result;
  };

  return (
    <div className="fill-in-blanks-container">
      <div 
        className="paragraph-container" 
        style={{ 
          fontSize: '1.1rem', 
          lineHeight: '2.2', 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        {renderParagraphWithBlanks()}
      </div>

      {!showAnswer && !isQuestionAnswered && availableWords.length > 0 && (
        <div className="words-container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '10px', color: '#64748b', fontSize: '0.9rem' }}>
            اسحب الكلمات إلى أماكنها الصحيحة
          </div>
          {availableWords.map((word, index) => (
            <div
              key={`${word}-${index}-${question.question}`}
              draggable={!showAnswer && !isQuestionAnswered}
              onDragStart={(e) => handleDragStart(e, word)}
              className="draggable-word"
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                border: '2px solid #3b82f6',
                borderRadius: '20px',
                cursor: (!showAnswer && !isQuestionAnswered) ? 'grab' : 'default',
                userSelect: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#1e40af',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transform: draggedWord === word ? 'scale(0.95)' : 'scale(1)',
                opacity: (!showAnswer && !isQuestionAnswered) ? 1 : 0.6
              }}
              onMouseDown={(e) => {
                if (!showAnswer && !isQuestionAnswered) {
                  e.target.style.cursor = 'grabbing';
                }
              }}
              onMouseUp={(e) => {
                if (!showAnswer && !isQuestionAnswered) {
                  e.target.style.cursor = 'grab';
                }
              }}
            >
              {word}
            </div>
          ))}
        </div>
      )}

      {showAnswer && (
        <div className="fill-blanks-results" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ color: '#0369a1', marginBottom: '10px' }}>النتيجة:</h4>
          {question.blanks.map((blank, index) => {
            const userAnswer = droppedWords[blank.id];
            const isCorrect = userAnswer === blank.correctAnswer;
            return (
              <div key={blank.id} style={{ 
                margin: '5px 0',
                color: isCorrect ? '#16a34a' : '#dc2626'
              }}>
                <strong>الفراغ {index + 1}:</strong> 
                <span style={{ marginLeft: '10px' }}>
                  {userAnswer || 'لم يتم الإجابة'} 
                  {isCorrect ? ' ✓' : ` ✗ (الصحيح: ${blank.correctAnswer})`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Composant principal pour router vers le bon type de question
export const QuestionRenderer = ({ 
  question, 
  onAnswer, 
  showAnswer, 
  isQuestionAnswered, 
  userAnswer,
  handleImageZoom 
}) => {
//   const renderQuestionWithImage = (QuestionComponent) => (
//     <div className="question-with-image">
//       <h3 className="question-text-optimized">{question.question}</h3>
      
//       {question.image && (
//         <div className="question-image-container-compact">
//           <picture>
//             <source srcSet={`${process.env.PUBLIC_URL}${question.image}`} type="image/webp" />
//             <img 
//               src={`${process.env.PUBLIC_URL}${question.image.replace('.webp', '.jpg')}`}
//               alt="سؤال عملي"
//               className="question-image-compact"
//               onClick={() => handleImageZoom && handleImageZoom(`${process.env.PUBLIC_URL}${question.image}`)}
//               style={{ cursor: 'pointer' }}
//               title="انقر للتكبير"
//             />
//           </picture>
//         </div>
//       )}
      
//       <QuestionComponent />
//     </div>
//   );

  switch (question.type) {
    case 'true-false':
      return (
        <TrueFalseQuestion
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userAnswer={userAnswer}
        />
      );
    
    case 'drag-drop-timeline':
      return (
        <DragDropTimeline
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userAnswers={userAnswer}
        />
      );
    
    case 'match-arrows':
      return (
        <MatchArrows
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userMatches={userAnswer}
        />
      );
    
    case 'multiple-checkbox':
      return (
        <MultipleCheckbox
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userAnswers={userAnswer}
        />
      );
    
    case 'reorder':
      return (
        <ReorderQuestion
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userOrder={userAnswer}
        />
      );
    
    case 'fill-in-blanks':
      return (
        <FillInBlanksQuestion
          question={question}
          onAnswer={onAnswer}
          showAnswer={showAnswer}
          isQuestionAnswered={isQuestionAnswered}
          userAnswers={userAnswer}
        />
      );
    
    default:
      // Question QCM classique
      return (
        <div className="qcm-question">
          <h3 className="question-text-optimized">{question.question}</h3>
          
          {question.image && (
            <div className="question-image-container-compact">
              <picture>
                <source srcSet={`${process.env.PUBLIC_URL}${question.image}`} type="image/webp" />
                <img 
                  src={`${process.env.PUBLIC_URL}${question.image.replace('.webp', '.jpg')}`}
                  alt="سؤال عملي"
                  className="question-image-compact"
                  onClick={() => handleImageZoom && handleImageZoom(`${process.env.PUBLIC_URL}${question.image}`)}
                  style={{ cursor: 'pointer' }}
                  title="انقر للتكبير"
                />
              </picture>
            </div>
          )}

          <div className="options-container-optimized">
            {question.options.map((option, index) => {
              let buttonClass = 'option-button-optimized smooth-transition';
              
              if (showAnswer) {
                if (index === question.correct) {
                  buttonClass += ' correct';
                } else if (index === userAnswer && userAnswer !== question.correct) {
                  buttonClass += ' wrong';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => onAnswer(index)}
                  disabled={showAnswer || isQuestionAnswered}
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
        </div>
      );
  }
};