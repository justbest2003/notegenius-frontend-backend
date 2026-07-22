import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesApi } from '../services/api';
import NoteCard from '../components/NoteCard';
import {
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineMicrophone,
  HiOutlinePhotograph
} from 'react-icons/hi';
import './NotesPage.css';

export default function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await notesApi.getAll();
        setNotes(res.data.notes);
      } catch (err) {
        console.warn('Backend not available:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchSearch = !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchFilter = filter === 'all' || note.source === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="notes-page animate-fade-in">
      {/* Header */}
      <div className="notes-header">
        <div className="page-header">
          <h1><HiOutlineDocumentText className="inline-icon" /> โน้ตทั้งหมด</h1>
          <p>จัดการบันทึกทั้งหมดของคุณ ({notes.length} รายการ)</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/notes/new')}
          id="create-note-btn"
        >
          <HiOutlinePlusCircle />
          สร้างโน้ตใหม่
        </button>
      </div>

      {/* Toolbar */}
      <div className="notes-toolbar">
        <div className="notes-search">
          <HiOutlineSearch className="notes-search-icon" />
          <input
            type="text"
            className="input-field notes-search-input"
            placeholder="ค้นหาโน้ต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-notes"
          />
        </div>

        <div className="notes-filters">
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'manual', label: <><HiOutlinePencil className="inline-icon" /> เขียน</> },
            { key: 'voice', label: <><HiOutlineMicrophone className="inline-icon" /> เสียง</> },
            { key: 'ocr', label: <><HiOutlinePhotograph className="inline-icon" /> รูปภาพ</> },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="notes-view-toggle">
          <button
            className={`btn-icon ${viewMode === 'grid' ? 'btn-icon--active' : ''}`}
            onClick={() => setViewMode('grid')}
            id="view-grid"
          >
            <HiOutlineViewGrid />
          </button>
          <button
            className={`btn-icon ${viewMode === 'list' ? 'btn-icon--active' : ''}`}
            onClick={() => setViewMode('list')}
            id="view-list"
          >
            <HiOutlineViewList />
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="notes-loading">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton note-skeleton" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className={`notes-grid ${viewMode === 'list' ? 'notes-grid--list' : ''} stagger-children`}>
          {filteredNotes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => navigate(`/notes/${note._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiOutlineDocumentText />
          </div>
          <h3>{search ? 'ไม่พบโน้ตที่ค้นหา' : 'ยังไม่มีโน้ต'}</h3>
          <p>{search ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นสร้างโน้ตแรกของคุณเลย!'}</p>
          {!search && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/notes/new')}
              style={{ marginTop: '1rem' }}
            >
              <HiOutlinePlusCircle />
              สร้างโน้ตแรก
            </button>
          )}
        </div>
      )}
    </div>
  );
}
