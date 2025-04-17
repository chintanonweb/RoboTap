import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Heart, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 0) : 0;
  });
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [level, setLevel] = useState(1);
  const [timeLimit, setTimeLimit] = useState(2000);

  const [playClick] = useSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', { 
    volume: isMuted ? 0 : 0.5 
  });
  const [playGameOver] = useSound('https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3', { 
    volume: isMuted ? 0 : 0.5 
  });

  const moveRobot = useCallback(() => {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    setPosition({ x, y });
    setIsVisible(true);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setStreak(0);
    setLevel(1);
    setTimeLimit(2000);
    moveRobot();
  };

  useEffect(() => {
    if (!isGameOver) {
      const disappearTimer = setTimeout(() => {
        if (isVisible && !isGameOver) {
          setIsVisible(false);
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives === 0) {
              setIsGameOver(true);
              if (!isMuted) playGameOver();
              if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('highScore', score.toString());
              }
            }
            return newLives;
          });
          setStreak(0);
        }
      }, timeLimit);

      const moveTimer = setTimeout(() => {
        if (!isGameOver) {
          moveRobot();
        }
      }, timeLimit + 200);

      return () => {
        clearTimeout(disappearTimer);
        clearTimeout(moveTimer);
      };
    }
  }, [isVisible, isGameOver, moveRobot, score, highScore, timeLimit, isMuted, playGameOver]);

  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setLevel((prev) => prev + 1);
      setTimeLimit((prev) => Math.max(prev * 0.9, 800));
    }
  }, [score]);

  const handleClick = () => {
    if (isVisible && !isGameOver) {
      if (!isMuted) playClick();
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setIsVisible(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Game HUD */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {[...Array(lives)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold">{highScore}</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Level and Streak Display */}
      <div className="fixed top-20 right-4 text-right">
        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-lg">Level {level}</span>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm text-yellow-400"
            >
              {streak} Streak! 🔥
            </motion.div>
          )}
        </div>
      </div>

      {/* Game Area */}
      {!isGameOver ? (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
            >
              <button
                onClick={handleClick}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transform hover:scale-110 transition-all shadow-lg shadow-purple-500/20"
              >
                <Bot className="w-12 h-12" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl text-center border border-white/10 shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Game Over!
            </h2>
            <p className="text-xl mb-2">Score: {score}</p>
            <p className="text-xl mb-2">High Score: {highScore}</p>
            <p className="text-lg mb-6">Level Reached: {level}</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              Play Again
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Initial Start Screen */}
      {!isGameOver && score === 0 && lives === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl text-center border border-white/10 shadow-2xl max-w-lg"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Click-A-Bot
            </h1>
            <p className="text-xl mb-6 text-gray-300">Click the robots before they disappear!</p>
            <div className="space-y-4 mb-8 text-left text-gray-300">
              <p>🎯 Click fast to score points</p>
              <p>⚡ Level up every 5 points</p>
              <p>🔥 Build streaks for bonus excitement</p>
              <p>❤️ You have 3 lives - make them count!</p>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              Start Game
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default App;