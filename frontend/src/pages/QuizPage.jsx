import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';
import { quizAPI } from '../services/api';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting location.state to have { video_title, skill_name, video_id }
  const { video_title, skill_name, video_id } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!video_title || !skill_name) {
      toast.error("Missing quiz context. Please access quiz from a learning path.");
      navigate('/roadmaps');
      return;
    }
    fetchQuiz();
  }, [video_title, skill_name]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizAPI.get({ video_title, skill_name });
      // The API returns the quiz data. Often it's in res.data or directly res depending on axios interceptor
      const quizData = res.data?.quiz || res.quiz || res.data || [];
      if (Array.isArray(quizData) && quizData.length > 0) {
        setQuestions(quizData);
      } else {
        toast.error("No questions found for this topic.");
      }
    } catch (error) {
      console.error('Quiz fetch error', error);
      toast.error('Failed to generate quiz. The AI might be currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    if (selectedAnswer) return; // Prevent changing answer
    setSelectedAnswer(option);
    
    const newAnswers = [...answers, {
      question: questions[currentIdx].question,
      selected: option,
      correct: questions[currentIdx].correct_answer,
      isCorrect: option === questions[currentIdx].correct_answer
    }];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      const score = answers.filter(a => a.isCorrect).length;
      const passed = score >= Math.ceil(questions.length * 0.7); // 70% to pass
      
      const payload = {
        video_id,
        skill_name,
        score,
        total: questions.length,
        passed,
        answers: answers.map(a => ({ question: a.question, answer: a.selected }))
      };

      // In a real app we'd post this to save progress
      // await quizAPI.submit(payload);

      setResult({ score, total: questions.length, passed });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit quiz results.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400">AI is generating your quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <button onClick={() => navigate(-1)} className="text-blue-400 underline">Go Back</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0a0a0a] px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-md"
        >
          {result.passed ? (
            <Award className="w-20 h-20 text-green-400 mx-auto mb-6" />
          ) : (
            <RotateCcw className="w-20 h-20 text-orange-400 mx-auto mb-6" />
          )}
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {result.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-400 mb-6">
            You scored <span className="text-white font-bold">{result.score}</span> out of {result.total}.
          </p>
          
          <div className="h-2 w-full bg-gray-800 rounded-full mb-8 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(result.score / result.total) * 100}%` }}
              className={`h-full ${result.passed ? 'bg-green-500' : 'bg-orange-500'}`}
            />
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => navigate('/roadmaps')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
            >
              Return to Roadmap
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-blue-400 font-medium mb-2">Skill Check: {skill_name}</p>
          <h1 className="text-2xl font-bold text-white">{video_title}</h1>
        </div>
        <div className="text-gray-400 font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          {currentIdx + 1} / {questions.length}
        </div>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
      >
        <h2 className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correct_answer;
            const showCorrect = selectedAnswer && isCorrect;
            const showWrong = isSelected && !isCorrect;

            let btnClass = "border-white/10 hover:bg-white/5 text-gray-300";
            if (showCorrect) btnClass = "bg-green-500/20 border-green-500/50 text-green-300";
            if (showWrong) btnClass = "bg-red-500/20 border-red-500/50 text-red-300";
            if (selectedAnswer && !isSelected && !isCorrect) btnClass = "opacity-50 border-white/5 text-gray-500";

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${btnClass}`}
              >
                <span>{option}</span>
                {showCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-400" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    <span className="font-semibold block mb-1">Explanation:</span>
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedAnswer || submitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              selectedAnswer 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{currentIdx === questions.length - 1 ? (submitting ? 'Submitting...' : 'Finish Quiz') : 'Next Question'}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizPage;
