import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingList from './components/MeetingList';
import MeetingDetail from './components/MeetingDetail';
import UploadModal from './components/UploadModal';
import { api } from './services/api';
import { 
  LayoutGrid, FileAudio, User, LogOut, Upload, Menu, 
  Settings, ShieldAlert, Key, Edit, CheckCircle, AlertCircle 
} from 'lucide-react';

function AppContent() {
  const { user, loading, logout, updateProfile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Profile management states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    // Reset profile statuses if switching views
    if (view !== 'profile') {
      setProfileMsg(null);
      setPwdMsg(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleUploadSuccess = async (meetingData) => {
    try {
      // Automatically trigger background pipeline
      api.meetings.startProcessing(meetingData.id).catch(err => {
        console.error("Auto-start processing failed:", err);
      });
    } catch (err) {
      console.error("Failed to initiate processing:", err);
    }
    // Redirect to detail page of the uploaded meeting
    handleNavigate('meeting-detail', { id: meetingData.id });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!fullName.trim()) return;

    setProfileLoading(true);
    try {
      await updateProfile(fullName.trim());
      setProfileMsg({ type: 'success', text: 'Full name updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.auth.changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setPwdMsg({ type: 'success', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Incorrect current password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner spinner-lg"></div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Verifying credentials...</p>
      </div>
    );
  }

  // Not Authenticated -> Show Auth screen
  if (!user) {
    return <Auth />;
  }

  // Render correct view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            onOpenUpload={() => setUploadModalOpen(true)} 
          />
        );
      case 'meetings':
        return (
          <MeetingList 
            onNavigate={handleNavigate} 
            onOpenUpload={() => setUploadModalOpen(true)} 
          />
        );
      case 'meeting-detail':
        return (
          <MeetingDetail 
            meetingId={viewParams.id} 
            onNavigate={handleNavigate} 
          />
        );
      case 'profile':
        return (
          <div className="profile-view animate-fade-in" style={{ padding: '2.5rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h1 className="font-display" style={{ marginBottom: '2rem' }}>User Settings</h1>
            
            <div className="grid-cols-1">
              {/* Profile Details */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <User className="text-accent" size={20} />
                  <h3 style={{ color: 'white' }}>Profile Details</h3>
                </div>
                
                <form onSubmit={handleUpdateProfile}>
                  {profileMsg && (
                    <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-danger'} animate-fade-in`}>
                      {profileMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="profileEmail">Email Address</label>
                    <input 
                      type="text" 
                      id="profileEmail" 
                      className="form-input" 
                      value={user.email} 
                      disabled 
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profileName">Full Name</label>
                    <input 
                      type="text" 
                      id="profileName" 
                      className="form-input" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={profileLoading}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={profileLoading || fullName.trim() === user.full_name}>
                    {profileLoading ? <div className="spinner spinner-sm"></div> : 'Save Profile'}
                  </button>
                </form>
              </div>

              {/* Security Details */}
              <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Key className="text-accent" size={20} />
                  <h3 style={{ color: 'white' }}>Update Password</h3>
                </div>
                
                <form onSubmit={handleChangePassword}>
                  {pwdMsg && (
                    <div className={`alert ${pwdMsg.type === 'success' ? 'alert-success' : 'alert-danger'} animate-fade-in`}>
                      {pwdMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      <span>{pwdMsg.text}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="currentPassword">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      className="form-input" 
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={pwdLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">New Password</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      className="form-input" 
                      placeholder="•••••••• (Min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={pwdLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      className="form-input" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={pwdLoading}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}>
                    {pwdLoading ? <div className="spinner spinner-sm"></div> : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="center-container">
            <h2 style={{ color: 'white' }}>404 Not Found</h2>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleNavigate('dashboard')}>
              Go Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Nav */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed-menu' : ''}`} style={{ borderRight: '1px solid var(--card-border)' }}>
        
        {/* Branding header */}
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--card-border)', gap: '0.75rem', overflow: 'hidden' }}>
          <div className="logo-icon" style={{ flexShrink: 0 }}>M</div>
          <span className="logo-text font-display sidebar-text" style={{ fontSize: '1.25rem' }}>MeetMind <span className="text-accent">AI</span></span>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <button 
            className={`btn btn-ghost btn-block nav-sidebar-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: '0.75rem 1rem' }}
          >
            <LayoutGrid size={18} />
            {!sidebarCollapsed && <span className="sidebar-text">Dashboard</span>}
          </button>
          
          <button 
            className={`btn btn-ghost btn-block nav-sidebar-btn ${currentView === 'meetings' || currentView === 'meeting-detail' ? 'active' : ''}`}
            onClick={() => handleNavigate('meetings')}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: '0.75rem 1rem' }}
          >
            <FileAudio size={18} />
            {!sidebarCollapsed && <span className="sidebar-text">Meetings</span>}
          </button>
          
          <button 
            className="btn btn-ghost btn-block nav-sidebar-btn"
            onClick={() => setUploadModalOpen(true)}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: '0.75rem 1rem' }}
          >
            <Upload size={18} />
            {!sidebarCollapsed && <span className="sidebar-text">Upload</span>}
          </button>

          <div style={{ margin: '1rem 0', borderTop: '1px solid var(--card-border)' }}></div>

          <button 
            className={`btn btn-ghost btn-block nav-sidebar-btn ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavigate('profile')}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: '0.75rem 1rem' }}
          >
            <User size={18} />
            {!sidebarCollapsed && <span className="sidebar-text">Settings</span>}
          </button>
        </div>

        {/* Footer / User Profile Summary block */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, justifyContent: 'center' }}>
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.875rem', color: 'white', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.full_name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</span>
              </div>
            )}
            <button className="btn-ghost" onClick={logout} style={{ color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="main-content">
        {/* Top Navbar Header */}
        <div className="header">
          <button 
            className="btn btn-ghost" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status: <span style={{ color: 'var(--success)', fontWeight: '600' }}>Backend Online</span></span>
          </div>
        </div>

        {/* Core Subviews */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderView()}
        </div>
      </div>

      {/* Shared Upload Overlay Modal */}
      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
