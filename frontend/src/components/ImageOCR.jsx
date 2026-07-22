import { useState, useRef } from 'react';
import { aiApi } from '../services/api';
import { HiOutlinePhotograph, HiOutlineUpload, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi';
import './ImageOCR.css';

export default function ImageOCR({ onTextExtracted }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const res = await aiApi.ocr(formData);
      
      const result = res.data.text;
      setExtractedText(result);
      onTextExtracted?.(result);
    } catch (err) {
      console.error('OCR error:', err);
      setExtractedText('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-ocr">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
        id="ocr-file-input"
      />

      {!preview ? (
        <button
          className="ocr-upload-area"
          onClick={() => fileInputRef.current?.click()}
          id="ocr-upload-btn"
        >
          <HiOutlinePhotograph className="ocr-upload-icon" />
          <span className="ocr-upload-text">อัพโหลดรูปภาพ</span>
          <span className="ocr-upload-hint">รองรับ JPG, PNG, WEBP</span>
        </button>
      ) : (
        <div className="ocr-preview animate-scale-in">
          <div className="ocr-preview-header">
            <span>รูปภาพ</span>
            <button className="btn-icon" onClick={clearImage}>
              <HiOutlineX />
            </button>
          </div>
          <img src={preview} alt="OCR Preview" className="ocr-preview-image" />
          <button
            className="btn btn-primary btn-sm ocr-extract-btn"
            onClick={handleExtract}
            disabled={loading}
            id="ocr-extract-btn"
          >
            {loading ? (
              <><HiOutlineUpload className="spin" /> กำลังอ่านข้อความ...</>
            ) : (
              <><HiOutlinePhotograph /> ดึงข้อความจากรูป (OCR)</>
            )}
          </button>
        </div>
      )}

      {extractedText && (
        <div className="ocr-result animate-fade-in-up">
          <h4><HiOutlineDocumentText className="inline-icon" /> ข้อความที่ได้:</h4>
          <p>{extractedText}</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onTextExtracted?.(extractedText)}
          >
            เพิ่มลงโน้ต
          </button>
        </div>
      )}
    </div>
  );
}
