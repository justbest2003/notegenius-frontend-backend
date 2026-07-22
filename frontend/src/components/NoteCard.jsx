import { HiOutlineSparkles, HiOutlinePencil, HiOutlineMicrophone, HiOutlinePhotograph, HiOutlineDocumentText } from 'react-icons/hi';
import './NoteCard.css';

export default function NoteCard({ note, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sourceIcon = {
    manual: <HiOutlinePencil />,
    voice: <HiOutlineMicrophone />,
    ocr: <HiOutlinePhotograph />,
  };

  const truncateContent = (text, maxLen = 120) => {
    if (!text) return 'ไม่มีเนื้อหา';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  return (
    <article className="note-card glass-card" onClick={() => onClick?.(note)} id={`note-${note._id || note.id}`}>
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title || 'ไม่มีชื่อ'}</h3>
        <span className="note-card-source" title={note.source}>
          {sourceIcon[note.source] || <HiOutlineDocumentText />}
        </span>
      </div>

      <p className="note-card-content">{truncateContent(note.content)}</p>

      {note.summary && (
        <div className="note-card-summary">
          <HiOutlineSparkles className="note-card-summary-icon" />
          <span>{truncateContent(note.summary, 80)}</span>
        </div>
      )}

      <div className="note-card-footer">
        <div className="note-card-tags">
          {note.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
          {note.tags?.length > 3 && (
            <span className="tag">+{note.tags.length - 3}</span>
          )}
        </div>
        <span className="note-card-date">{formatDate(note.created_at || new Date())}</span>
      </div>
    </article>
  );
}
