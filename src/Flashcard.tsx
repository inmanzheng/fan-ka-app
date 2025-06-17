import React from 'react';
import './Flashcard.css';

interface FlashcardProps {
  chinese: string;
  english: string;
  flipped: boolean;
  setFlipped: (f: boolean | ((f: boolean) => boolean)) => void;
}

// 语音选择优化：优先选用更自然的 voice
function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  // 优先选用 Google/Microsoft/Apple 等高质量 voice
  const preferred = voices.find(v => v.lang === lang && /Google|Microsoft|Apple|Xiao/i.test(v.name));
  if (preferred) return preferred;
  // 其次选用任意匹配语言的 voice
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

const Flashcard: React.FC<FlashcardProps> = ({ chinese, english, flipped, setFlipped }) => {
  // 阻止事件冒泡，点击文字时只发音不翻面
  const handleSpeak = (e: React.MouseEvent, text: string, lang: string) => {
    e.stopPropagation();
    speak(text, lang);
  };

  return (
    <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="card-content" onClick={e => handleSpeak(e, chinese, 'zh-CN')}>
            {chinese}
          </div>
        </div>
        <div className="flashcard-back">
          <div className="card-content" onClick={e => handleSpeak(e, english, 'en-US')}>
            {english}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 