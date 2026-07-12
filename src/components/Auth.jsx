import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ChevronRight, MessageSquare, Clock, Zap } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error, clearError } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setValidationError(null);
    setSuccessMsg(null);
    clearError();
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  const validate = () => {
    if (!email || !password) {
      return 'All fields are required.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (!isLogin) {
      if (!fullName) {
        return 'Full name is required.';
      }
      if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match.';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);
    clearError();

    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const res = await register(fullName, email, password, confirmPassword);
        if (res.success) {
          setSuccessMsg('Registration successful! Please log in.');
          setIsLogin(true);
          // Clear inputs
          setEmail(email); // Keep email for convenience
          setPassword('');
          setFullName('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left panel: Branding / Visuals */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-glow"></div>
        <div className="auth-sidebar-content">
          <div className="brand-logo">
            <span className="logo-icon">M</span>
            <span className="logo-text font-display">MeetMind <span className="text-accent">AI</span></span>
          </div>
          
          <div className="auth-sidebar-hero">
            <h1 className="font-display">Unlock the Intelligence in Your Meetings</h1>
            <p>Upload your meeting recordings and let AI extract key summaries, action items, deadlines, and converse directly with your meeting history.</p>
          </div>
          
          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="feature-icon-wrapper">
                <Zap size={18} />
              </div>
              <div>
                <h4>Automatic Transcription</h4>
                <p>Convert your audio into highly accurate transcripts with speaker separation.</p>
              </div>
            </div>
            
            <div className="auth-feature-item">
              <div className="feature-icon-wrapper">
                <Clock size={18} />
              </div>
              <div>
                <h4>Structured Insights</h4>
                <p>Extract executive summaries, decisions, action items, and project risks instantly.</p>
              </div>
            </div>
            
            <div className="auth-feature-item">
              <div className="feature-icon-wrapper">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4>Meeting Assistant Chat</h4>
                <p>Converse with your meeting transcript to ask questions, draft emails, or verify facts.</p>
              </div>
            </div>
          </div>
          
          <div className="auth-sidebar-footer">
            <p>&copy; {new Date().getFullYear()} MeetMind AI. Industrial-Grade SaaS.</p>
          </div>
        </div>
      </div>
      
      {/* Right panel: Form */}
      <div className="auth-form-container">

          <div className="mobile-brand-logo">
            <span className="logo-icon">M</span>
            <span className="logo-text font-display">
                MeetMind <span className="text-accent">AI</span>
            </span>
          </div>
        <div className="auth-card glass-card animate-fade-in">
          <div className="auth-card-header">
            <h2 className="font-display">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to access your meeting insights' : 'Get started with MeetMind AI today'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Feedback Banners */}
            {(error || validationError) && (
              <div className="alert alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{validationError || error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="alert alert-success animate-fade-in">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="fullName"
                    className="form-input"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  <span>{isLogin ? 'Logging in...' : 'Registering...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <div className="auth-card-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="auth-link" onClick={toggleMode}>
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
