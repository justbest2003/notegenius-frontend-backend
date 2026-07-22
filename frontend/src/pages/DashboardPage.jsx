import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notesApi, usersApi } from '../services/api';
import StatsCard from '../components/StatsCard';
import NoteCard from '../components/NoteCard';
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineMicrophone,
  HiOutlinePhotograph,
  HiOutlinePlusCircle,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlinePencil,
  HiOutlineFolder,
  HiHand
} from 'react-icons/hi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    aiSummaries: 0,
    voiceNotes: 0,
    ocrNotes: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats from API
        const statsRes = await usersApi.getStats();
        setStats(statsRes.data.stats);

        // Fetch recent notes
        const notesRes = await notesApi.getAll();
        setRecentNotes(notesRes.data.notes.slice(0, 3));

        // Ensure user profile exists
        await usersApi.getProfile();
      } catch (err) {
        console.warn('Backend not available, using empty state:', err.message);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {user?.displayName || 'คุณผู้ใช้'} <HiHand className="inline-icon" style={{ color: '#FFD700' }} />
          </h1>
          <p className="dashboard-subtitle">นี่คือภาพรวมกิจกรรมของคุณวันนี้</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/notes/new')}
          id="new-note-btn"
        >
          <HiOutlinePlusCircle />
          สร้างโน้ตใหม่
        </button>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats stagger-children">
        <StatsCard
          icon={<HiOutlineDocumentText />}
          label="โน้ตทั้งหมด"
          value={stats.totalNotes}
          trend={12}
          color="primary"
        />
        <StatsCard
          icon={<HiOutlineSparkles />}
          label="สรุป AI"
          value={stats.aiSummaries}
          trend={8}
          color="success"
        />
        <StatsCard
          icon={<HiOutlineMicrophone />}
          label="บันทึกเสียง"
          value={stats.voiceNotes}
          trend={15}
          color="warning"
        />
        <StatsCard
          icon={<HiOutlinePhotograph />}
          label="สแกนรูปภาพ"
          value={stats.ocrNotes}
          trend={5}
          color="info"
        />
      </div>

      {/* Recent Notes */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>
            <HiOutlineClock />
            โน้ตล่าสุด
          </h2>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/notes')}
          >
            ดูทั้งหมด →
          </button>
        </div>
        <div className="dashboard-notes stagger-children">
          {recentNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => navigate(`/notes/${note._id}`)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">
          <HiOutlineLightningBolt className="inline-icon" style={{ color: 'var(--warning)' }} /> การดำเนินการด่วน
        </h2>
        <div className="dashboard-actions stagger-children">
          <button
            className="action-card glass-card"
            onClick={() => navigate('/notes/new')}
          >
            <span className="action-icon"><HiOutlinePencil /></span>
            <span className="action-label">เขียนโน้ต</span>
          </button>
          <button
            className="action-card glass-card"
            onClick={() => navigate('/notes/new?source=voice')}
          >
            <span className="action-icon"><HiOutlineMicrophone /></span>
            <span className="action-label">บันทึกเสียง</span>
          </button>
          <button
            className="action-card glass-card"
            onClick={() => navigate('/notes/new?source=ocr')}
          >
            <span className="action-icon"><HiOutlinePhotograph /></span>
            <span className="action-label">สแกนรูปภาพ</span>
          </button>
          <button
            className="action-card glass-card"
            onClick={() => navigate('/notes')}
          >
            <span className="action-icon"><HiOutlineFolder /></span>
            <span className="action-label">โน้ตทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
}
