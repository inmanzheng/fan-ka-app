import React from 'react';
import './Flashcard.css';

interface FlashcardProps {
  chinese: string;
  english: string;
  flipped: boolean;
  setFlipped: (f: boolean | ((f: boolean) => boolean)) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ chinese, english, flipped, setFlipped }) => {
  // 只允许背面英文发音，调用腾讯云TTS
  const handleSpeak = async (e: React.MouseEvent, text: string, lang: string) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      if (!response.ok) throw new Error('TTS API request failed');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (err) {
      alert('语音合成失败，请检查网络或联系管理员');
    }
  };

  return (
    <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="card-content">
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