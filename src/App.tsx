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

  // 新的语音合成逻辑：调用后端代理
  const speak = async (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // 停止浏览器自带的可能在播放的语音
    }
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, lang }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // 播放结束后释放资源
      };
    } catch (error: any) {
      console.error('Error during speech synthesis:', error);
      alert('语音合成失败：' + error.message + '。请检查网络或联系管理员。\n\n（如果本地开发遇到跨域问题，请确保在 vite.config.ts 中配置代理，或直接部署到 Vercel 测试。）');
      // 失败时，尝试回退到浏览器自带的语音合成（作为备用方案）
      if ('speechSynthesis' in window) {
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = lang;
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const card = flashcards[index];

  return (
    <>
      <div className="app-container">
        <Flashcard chinese={card.chinese} english={card.english} flipped={flipped} setFlipped={setFlipped} onSpeak={speak} />
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