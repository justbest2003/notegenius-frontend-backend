from google import genai
from config import settings


class LLMService:
    """Google Gemini AI service for text summarization and auto-tagging"""

    def __init__(self):
        self.client = None
        self.model_name = "gemini-flash-lite-latest"

        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY":
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            print(f"[OK] Gemini AI initialized (model: {self.model_name})")
        else:
            print("[WARN] Gemini API Key not set. Using mock responses.")

    async def summarize(self, content: str) -> str:
        """สรุปเนื้อหาด้วย AI"""
        if not self.client:
            return self._mock_summarize(content)

        try:
            prompt = f"""สรุปข้อความต่อไปนี้เป็นภาษาไทย ให้กระชับและได้ใจความ (ไม่เกิน 3 ประโยค):

{content}

สรุป:"""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text.strip()

        except Exception as e:
            print(f"❌ Gemini summarize error: {e}")
            return self._mock_summarize(content)

    async def auto_tag(self, content: str) -> list[str]:
        """สร้างแท็กอัตโนมัติด้วย AI"""
        if not self.client:
            return self._mock_auto_tag(content)

        try:
            prompt = f"""วิเคราะห์ข้อความต่อไปนี้แล้วสร้างแท็กภาษาไทย 3-5 แท็ก ที่เหมาะสม
ตอบเป็นรายการแท็ก คั่นด้วยเครื่องหมายจุลภาค (,) เท่านั้น ไม่ต้องมีคำอธิบาย:

{content}

แท็ก:"""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )

            raw = response.text.strip()
            tags = [t.strip().strip("#") for t in raw.split(",") if t.strip()]
            return tags[:5]  # Max 5 tags

        except Exception as e:
            print(f"❌ Gemini auto-tag error: {e}")
            return self._mock_auto_tag(content)

    def _mock_summarize(self, content: str) -> str:
        """Mock summarize for demo"""
        words = content[:100]
        return f"[Mock AI] สรุป: {words}..."

    def _mock_auto_tag(self, content: str) -> list[str]:
        """Mock auto-tag for demo"""
        return ["บันทึก", "สำคัญ", "AI", "สรุป"]


# Singleton
llm_service = LLMService()
