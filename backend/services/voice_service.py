class VoiceService:
    """Voice-to-text service
    
    Note: Primary speech-to-text is handled client-side via Web Speech API.
    This service handles server-side audio processing if needed (e.g., Whisper).
    """

    def __init__(self):
        self.has_whisper = False
        try:
            import whisper
            self.model = whisper.load_model("base")
            self.has_whisper = True
            print("✅ Whisper model loaded")
        except ImportError:
            print("⚠️  Whisper not installed. Voice processing handled client-side (Web Speech API).")

    async def transcribe(self, audio_bytes: bytes, language: str = "th") -> str:
        """แปลงเสียงเป็นข้อความ"""
        if self.has_whisper:
            return self._whisper_transcribe(audio_bytes, language)
        else:
            return self._mock_transcribe()

    def _whisper_transcribe(self, audio_bytes: bytes, language: str) -> str:
        """Transcribe using OpenAI Whisper"""
        try:
            import tempfile
            import os

            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            # Transcribe
            result = self.model.transcribe(temp_path, language=language)
            os.unlink(temp_path)
            return result["text"].strip()

        except Exception as e:
            print(f"❌ Whisper error: {e}")
            return self._mock_transcribe()

    def _mock_transcribe(self) -> str:
        """Mock transcribe for demo"""
        return (
            "[Mock Voice] ข้อความจากเสียงพูด: "
            "ระบบ Voice-to-Text หลักทำงานฝั่ง Client (Web Speech API) "
            "ส่วน Server-side รองรับ Whisper สำหรับไฟล์เสียงที่อัพโหลด"
        )


# Singleton
voice_service = VoiceService()
