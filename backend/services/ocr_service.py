from PIL import Image
import io
from services.llm_service import llm_service

class OCRService:
    """Image-to-text service using Gemini API or mock"""

    def __init__(self):
        print("[OK] OCR Service initialized (using Gemini)")

    async def extract_text(self, image_bytes: bytes) -> str:
        """ดึงข้อความจากรูปภาพ"""
        if not llm_service.client:
            print("[WARN] Gemini API client not available. Falling back to mock OCR.")
            return self._mock_ocr(image_bytes)
            
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # แปลงภาพให้อยู่ในโหมดที่รองรับ
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
                
            prompt = "อ่านข้อความทั้งหมดในรูปภาพนี้ออกมา พิมพ์เฉพาะข้อความที่เห็นแบบตรงไปตรงมา ไม่ต้องเพิ่มคำอธิบาย ถ้าไม่มีข้อความเลยให้ตอบว่า 'ไม่พบข้อความ'"
            
            response = llm_service.client.models.generate_content(
                model=llm_service.model_name,
                contents=[image, prompt]
            )
            return response.text.strip()
        except Exception as e:
            print(f"[ERROR] Gemini OCR error: {e}")
            return self._mock_ocr(image_bytes)

    def _mock_ocr(self, image_bytes: bytes) -> str:
        """Mock OCR for demo"""
        size_kb = len(image_bytes) / 1024
        return (
            f"[Mock OCR] ดึงข้อความจากรูปภาพสำเร็จ\n"
            f"ขนาดรูป: {size_kb:.1f} KB\n\n"
            f"ตัวอย่างข้อความที่ถูกแปลงจากรูปภาพ:\n"
            f"สามารถนำไปใส่ในโน้ตได้ทันที\n"
            f"รองรับทั้งภาษาไทยและภาษาอังกฤษ"
        )

# Singleton
ocr_service = OCRService()
