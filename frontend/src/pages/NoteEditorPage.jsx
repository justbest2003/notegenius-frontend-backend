import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { notesApi } from '../services/api';
import AISummaryPanel from '../components/AISummaryPanel';
import VoiceRecorder from '../components/VoiceRecorder';
import ImageOCR from '../components/ImageOCR';
import {
  HiOutlineArrowLeft,
  HiOutlineSave,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineMicrophone,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineChip
} from 'react-icons/hi';
import './NoteEditorPage.css';

export default function NoteEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('manual');
  const [usedVoice, setUsedVoice] = useState(false);
  const [usedOcr, setUsedOcr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check source from URL params
  useEffect(() => {
    const sourceParam = searchParams.get('source');
    if (sourceParam) {
      setSource(sourceParam);
      if (sourceParam === 'voice') setActivePanel('voice');
      if (sourceParam === 'ocr') setActivePanel('ocr');
    }
  }, [searchParams]);

  // Load existing note
  useEffect(() => {
    if (!isNew) {
      const loadNote = async () => {
        try {
          const res = await notesApi.getById(id);
          const note = res.data.note;
          setTitle(note.title || '');
          setContent(note.content || '');
          setTags(note.tags || []);
          setCategory(note.category || '');
          setSummary(note.summary || '');
          if (note.source) setSource(note.source);
          if (note.used_voice) setUsedVoice(true);
          if (note.used_ocr) setUsedOcr(true);
        } catch (err) {
          console.error('Load note error:', err);
          navigate('/notes');
        }
      };
      loadNote();
    }
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('กรุณาใส่ชื่อโน้ต');
      return;
    }
    setSaving(true);
    try {
      const noteData = { 
        title, content, tags, category, summary, source,
        used_voice: usedVoice, used_ocr: usedOcr
      };
      if (isNew) {
        await notesApi.create(noteData);
      } else {
        await notesApi.update(id, noteData);
      }
      navigate('/notes');
    } catch (err) {
      console.error('Save error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await notesApi.delete(id);
      navigate('/notes');
    } catch (err) {
      console.error('Delete error:', err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleVoiceTranscript = (text) => {
    setContent(prev => prev + (prev ? '\n' : '') + text);
    if (source === 'manual') setSource('voice');
    setUsedVoice(true);
  };

  const handleOCRText = (text) => {
    setContent(prev => prev + (prev ? '\n\n--- ข้อความจาก OCR ---\n' : '') + text);
    if (source === 'manual') setSource('ocr');
    setUsedOcr(true);
  };

  const handleSummaryGenerated = (summaryText) => {
    setSummary(summaryText);
  };

  const toolButtons = [
    { key: 'ai', icon: <HiOutlineSparkles />, label: 'AI สรุป', color: 'primary' },
    { key: 'voice', icon: <HiOutlineMicrophone />, label: 'เสียง', color: 'warning' },
    { key: 'ocr', icon: <HiOutlinePhotograph />, label: 'OCR', color: 'info' },
  ];

  return (
    <div className="editor-page animate-fade-in">
      {/* Top Bar */}
      <div className="editor-topbar">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          id="editor-back-btn"
        >
          <HiOutlineArrowLeft />
          กลับ
        </button>
        <div className="editor-topbar-actions">
          {!isNew && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowDeleteModal(true)}
              id="editor-delete-btn"
              style={{ color: 'var(--error)' }}
            >
              <HiOutlineTrash />
              ลบ
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            id="editor-save-btn"
          >
            <HiOutlineSave />
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main Editor */}
        <div className="editor-main">
          {/* Title */}
          <input
            type="text"
            className="editor-title"
            placeholder="ชื่อโน้ต..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="editor-title"
          />

          {/* Category */}
          <div className="editor-meta">
            <select
              className="editor-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="editor-category"
            >
              <option value="">เลือกหมวดหมู่</option>
              <option value="งาน">งาน</option>
              <option value="การเรียน">การเรียน</option>
              <option value="ส่วนตัว">ส่วนตัว</option>
              <option value="ไอเดีย">ไอเดีย</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* Content */}
          <textarea
            className="editor-content"
            placeholder="เริ่มเขียนโน้ตของคุณ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            id="editor-content"
          />

          {/* Tags */}
          <div className="editor-tags-section">
            <div className="editor-tags-header">
              <HiOutlineTag />
              <span>แท็ก</span>
            </div>
            <div className="editor-tags">
              {tags.map((tag, i) => (
                <span key={i} className="tag editor-tag">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="editor-tag-remove">×</button>
                </span>
              ))}
              <input
                type="text"
                className="editor-tag-input"
                placeholder="เพิ่มแท็ก..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                id="editor-tag-input"
              />
            </div>
          </div>
        </div>

        {/* Side Panel - AI Tools */}
        <div className="editor-sidebar">
          <div className="editor-tools">
            <h3 className="editor-tools-title">
              <HiOutlineChip className="inline-icon" style={{ color: 'var(--primary)' }} /> เครื่องมือ AI
            </h3>
            <div className="editor-tool-buttons">
              {toolButtons.map(tool => (
                <button
                  key={tool.key}
                  className={`editor-tool-btn ${activePanel === tool.key ? `editor-tool-btn--active editor-tool-btn--${tool.color}` : ''}`}
                  onClick={() => setActivePanel(activePanel === tool.key ? null : tool.key)}
                >
                  {tool.icon}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Panel */}
          {activePanel === 'ai' && (
            <div className="animate-fade-in-up">
              <AISummaryPanel
                content={content}
                onSummaryGenerated={handleSummaryGenerated}
              />
            </div>
          )}

          {activePanel === 'voice' && (
            <div className="editor-panel glass-card animate-fade-in-up">
              <h4 className="editor-panel-title">
                <HiOutlineMicrophone className="inline-icon" /> บันทึกเสียง
              </h4>
              <p className="editor-panel-desc">พูดเพื่อแปลงเป็นข้อความอัตโนมัติ</p>
              <VoiceRecorder onTranscript={handleVoiceTranscript} />
            </div>
          )}

          {activePanel === 'ocr' && (
            <div className="editor-panel glass-card animate-fade-in-up">
              <h4 className="editor-panel-title">
                <HiOutlinePhotograph className="inline-icon" /> สแกนรูปภาพ (OCR)
              </h4>
              <p className="editor-panel-desc">อัพโหลดรูปภาพเพื่อดึงข้อความ</p>
              <ImageOCR onTextExtracted={handleOCRText} />
            </div>
          )}

          {/* Summary Preview */}
          {summary && (
            <div className="editor-summary glass-card animate-fade-in-up">
              <h4><HiOutlineSparkles className="inline-icon" style={{ color: 'var(--warning)' }} /> สรุปโดย AI</h4>
              <p>{summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiOutlineTrash style={{ color: 'var(--error)' }} /> ลบโน้ต
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              คุณแน่ใจหรือไม่ที่จะลบโน้ตนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </button>
              <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-btn">
                ลบโน้ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
