import { useState, useRef } from 'react';
import { HiOutlineMicrophone, HiOutlineStop } from 'react-icons/hi';
import './VoiceRecorder.css';

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = () => {
    // ใช้ Web Speech API (Browser built-in)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition กรุณาใช้ Chrome');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onTranscript?.(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="voice-recorder">
      <button
        className={`voice-btn ${isRecording ? 'voice-btn--recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? 'หยุดบันทึก' : 'เริ่มบันทึกเสียง'}
        id="voice-record-btn"
      >
        {isRecording ? (
          <>
            <div className="voice-pulse" />
            <HiOutlineStop className="voice-icon" />
          </>
        ) : (
          <HiOutlineMicrophone className="voice-icon" />
        )}
      </button>
      <span className="voice-label">
        {isRecording ? 'กำลังฟัง...' : 'บันทึกเสียง'}
      </span>
      {transcript && (
        <div className="voice-transcript animate-fade-in">
          <p>{transcript}</p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setTranscript('')}
          >
            ล้าง
          </button>
        </div>
      )}
    </div>
  );
}
