import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMessages = {
        'auth/user-not-found': 'ไม่พบบัญชีนี้',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้แล้ว',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
      setError(errorMessages[err.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    }
  };

  return (
    <div className="login-page">
      {/* Background Effects */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb--1" />
        <div className="login-bg-orb login-bg-orb--2" />
        <div className="login-bg-orb login-bg-orb--3" />
      </div>

      <div className="login-container animate-fade-in-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <HiOutlineSparkles />
          </div>
          <h1 className="login-logo-text">NoteGenius</h1>
          <p className="login-logo-desc">จดบันทึกอัจฉริยะด้วย AI</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="login-field animate-fade-in-up">
              <div className="login-field-icon">
                <HiOutlineUser />
              </div>
              <input
                type="text"
                className="input-field login-input"
                placeholder="ชื่อที่แสดง"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                id="register-name"
              />
            </div>
          )}

          <div className="login-field">
            <div className="login-field-icon">
              <HiOutlineMail />
            </div>
            <input
              type="email"
              className="input-field login-input"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="login-field">
            <div className="login-field-icon">
              <HiOutlineLockClosed />
            </div>
            <input
              type="password"
              className="input-field login-input"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              id="login-password"
            />
          </div>

          {error && (
            <div className="login-error animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg login-submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? 'กำลังดำเนินการ...' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>หรือ</span>
        </div>

        {/* Google Login */}
        <button
          className="btn btn-secondary btn-lg login-google"
          onClick={handleGoogleLogin}
          id="google-login-btn"
        >
          <FcGoogle size={20} />
          เข้าสู่ระบบด้วย Google
        </button>

        {/* Toggle */}
        <p className="login-toggle">
          {isRegister ? 'มีบัญชีแล้ว?' : 'ยังไม่มีบัญชี?'}
          <button
            className="login-toggle-btn"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            id="toggle-auth-btn"
          >
            {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </p>

      </div>
    </div>
  );
}
