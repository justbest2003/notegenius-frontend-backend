import { useState } from 'react';
import { aiApi } from '../services/api';
import { HiOutlineSparkles, HiOutlineRefresh } from 'react-icons/hi';
import './AISummaryPanel.css';

export default function AISummaryPanel({ content, onSummaryGenerated }) {
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const handleSummarize = async () => {
    if (!content?.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.summarize(content);
      const result = res.data.summary;
      setSummary(result);
      onSummaryGenerated?.(result);
    } catch (err) {
      console.error('Summarize error:', err);
      setSummary('เกิดข้อผิดพลาดในการสรุป กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTag = async () => {
    if (!content?.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.autoTag(content);
      setTags(res.data.tags);
    } catch (err) {
      console.error('Auto-tag error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel glass-card">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <HiOutlineSparkles className="ai-panel-icon" />
          <span>AI Assistant</span>
        </div>
        <div className="ai-panel-tabs">
          <button
            className={`ai-tab ${activeTab === 'summary' ? 'ai-tab--active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            สรุป
          </button>
          <button
            className={`ai-tab ${activeTab === 'tags' ? 'ai-tab--active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            แท็ก
          </button>
        </div>
      </div>

      <div className="ai-panel-body">
        {activeTab === 'summary' && (
          <>
            <button
              className="btn btn-primary btn-sm ai-action-btn"
              onClick={handleSummarize}
              disabled={loading || !content?.trim()}
              id="ai-summarize-btn"
            >
              {loading ? (
                <><HiOutlineRefresh className="spin" /> กำลังสรุป...</>
              ) : (
                <><HiOutlineSparkles /> สรุปเนื้อหาด้วย AI</>
              )}
            </button>
            {summary && (
              <div className="ai-result animate-fade-in-up">
                <p>{summary}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'tags' && (
          <>
            <button
              className="btn btn-primary btn-sm ai-action-btn"
              onClick={handleAutoTag}
              disabled={loading || !content?.trim()}
              id="ai-autotag-btn"
            >
              {loading ? (
                <><HiOutlineRefresh className="spin" /> กำลังสร้างแท็ก...</>
              ) : (
                <><HiOutlineSparkles /> สร้างแท็กอัตโนมัติ</>
              )}
            </button>
            {tags.length > 0 && (
              <div className="ai-tags animate-fade-in-up">
                {tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!content?.trim() && (
        <p className="ai-panel-hint">พิมพ์เนื้อหาก่อนเพื่อใช้ AI</p>
      )}
    </div>
  );
}
