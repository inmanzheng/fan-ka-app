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
    <div className="app-container">
      <h1>翻卡记忆应用</h1>
      <Flashcard chinese={card.chinese} english={card.english} flipped={flipped} setFlipped={setFlipped} />
      <div className="card-actions">
        {flipped ? (
          <button className="speak-btn big" onClick={() => speak(card.english, 'en-US')}>🔊 Speak English</button>
        ) : (
          <button className="speak-btn big" onClick={() => speak(card.chinese, 'zh-CN')}>🔊 中文发音</button>
        )}
        <button className="flip-btn big" onClick={() => setFlipped(f => !f)}>{flipped ? '显示中文' : '显示英文'}</button>
      </div>
      <div className="controls">
        <button onClick={prev} className="nav-btn">上一张</button>
        <span>{index + 1} / {total}</span>
        <button onClick={next} className="nav-btn">下一张</button>
      </div>
    </div>
  );
};

export default App; 