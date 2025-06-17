import React, { useState } from 'react';
import Flashcard from './Flashcard';
import { flashcards } from '../flashcards';
import './App.css';

const App: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = flashcards.length;

  const prev = () => {
    setIndex(i => (i - 1 + total) % total);
    setFlipped(false);
  };
  const next = () => {
    setIndex(i => (i + 1) % total);
    setFlipped(false);
  };

  // 语音合成逻辑与 Flashcard 保持一致
  function getBestVoice(lang: string): SpeechSynthesisVoice | null {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === lang && /Google|Microsoft|Apple|Xiao/i.test(v.name));
    if (preferred) return preferred;
    const fallback = voices.find(v => v.lang === lang);
    return fallback || null;
  }
  const speak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // 新增：每次播放前先停止上一次
      const utter = new window.SpeechSynthesisUtterance(text);
      const voice = getBestVoice(lang);
      if (voice) utter.voice = voice;
      utter.lang = lang;
      window.speechSynthesis.speak(utter);
    } else {
      alert('当前浏览器不支持语音合成');
    }
  };

  const card = flashcards[index];

  return (
    <>
      <div className="app-container">
        <Flashcard chinese={card.chinese} english={card.english} flipped={flipped} setFlipped={setFlipped} />
      </div>
      <div className="controls-fixed-bottom">
        <button onClick={prev} className="nav-btn">上一张</button>
        <span>{index + 1} / {total}</span>
        <button onClick={next} className="nav-btn">下一张</button>
      </div>
    </>
  );
};

export default App; 