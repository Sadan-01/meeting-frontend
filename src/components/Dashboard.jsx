import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileAudio, CheckCircle, AlertTriangle, Activity, Clock, 
  Search, Upload, ArrowRight, HardDrive, BarChart3 
} from 'lucide-react';

export default function Dashboard({ onNavigate, onOpenUpload }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await api.dashboard.getOverview();
      if (res.success) {
        setStats(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh stats every 8 seconds if there are active background tasks
    const interval = setInterval(() => {
      if (stats?.processing_progress?.length > 0) {
        fetchDashboardData();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [stats?.processing_progress?.length]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await api.dashboard.search(searchQuery.trim());
      if (res.success) {
        setSearchResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner spinner-lg"></div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Loading dashboard workspace...</p>
      </div>
    );
  }

  const activePipelines = stats?.processing_progress || [];
  const recentMeetings = stats?.recent_meetings || [];

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="font-display">Welcome Back, {user?.full_name || 'User'}</h1>
          <p className="welcome-sub">Summarize, query, and unlock the metrics of your meeting recordings.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={18} />
          <span>Upload Recording</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper file-audio-icon">
            <FileAudio size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-title">Total Meetings</span>
            <span className="metric-value">{stats?.total_meetings ?? 0}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper success-icon">
            <CheckCircle size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-title">Completed Analytics</span>
            <span className="metric-value">{stats?.completed_meetings ?? 0}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper warning-icon">
            <Activity size={22} className={activePipelines.length > 0 ? 'animate-pulse' : ''} />
          </div>
          <div className="metric-data">
            <span className="metric-title">Active Pipelines</span>
            <span className="metric-value">{(stats?.processing_meetings ?? 0) + (stats?.queued_meetings ?? 0)}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper info-icon">
            <HardDrive size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-title">Storage Used</span>
            <span className="metric-value">{formatBytes(stats?.total_storage_used) || '0 MB'}</span>
          </div>
        </div>
      </div>

      {/* Search Console */}
      <div className="glass-card search-card" style={{ marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={20} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search transcripts, decisions, action items or meetings keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary search-btn-submit" disabled={searching}>
            {searching ? <div className="spinner spinner-sm"></div> : 'Search'}
          </button>
        </form>

        {/* Search Results Dropdown/List */}
        {searchResults.length > 0 && (
          <div className="search-results-list animate-fade-in">
            <div className="search-results-header">
              <span>Search Results ({searchResults.length})</span>
              <button className="text-link-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>Clear</button>
            </div>
            <div className="search-results-grid">
              {searchResults.map((m) => (
                <div key={m.id} className="search-result-item" onClick={() => onNavigate('meeting-detail', { id: m.id })}>
                  <div className="result-main">
                    <span className="result-title">{m.title}</span>
                    <span className="result-date">{new Date(m.upload_date).toLocaleDateString()}</span>
                  </div>
                  <div className="result-meta">
                    <span className={`badge badge-${m.processing_status.toLowerCase()}`}>{m.processing_status}</span>
                    <ArrowRight size={16} className="arrow-hover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Sections */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left-col">
          {/* Active Pipelines */}
          {activePipelines.length > 0 && (
            <div className="glass-card active-pipelines-card" style={{ marginBottom: '2rem' }}>
              <div className="card-header-with-action">
                <h3>Active Processing Pipelines</h3>
                <span className="live-pill"><span className="live-dot"></span>LIVE</span>
              </div>
              <div className="pipelines-list">
                {activePipelines.map((pipeline) => (
                  <div key={pipeline.id} className="pipeline-item">
                    <div className="pipeline-info">
                      <span className="pipeline-name">{pipeline.title}</span>
                      <span className="pipeline-status-text">
                        {pipeline.processing_status === 'QUEUED' ? 'Queued in line...' : 'Transcribing / Analyzing...'}
                      </span>
                    </div>
                    <div className="pipeline-progress-bar-container">
                      <div 
                        className="pipeline-progress-bar" 
                        style={{ width: `${pipeline.processing_progress || 10}%` }}
                      ></div>
                    </div>
                    <div className="pipeline-percentage">
                      <span>{pipeline.processing_progress || 10}% Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Meetings */}
          <div className="glass-card recent-meetings-card">
            <div className="card-header-with-action">
              <h3>Recent Meetings</h3>
              <button className="btn-text-link" onClick={() => onNavigate('meetings')}>View All</button>
            </div>
            
            {recentMeetings.length === 0 ? (
              <div className="empty-state">
                <FileAudio size={40} className="empty-icon" />
                <p className="empty-title">No Meetings Uploaded Yet</p>
                <p className="empty-description">Get started by uploading your first meeting audio recording.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={onOpenUpload}>
                  Upload Now
                </button>
              </div>
            ) : (
              <div className="meetings-list">
                {recentMeetings.map((meeting) => (
                  <div 
                    key={meeting.id} 
                    className="meeting-list-item"
                    onClick={() => onNavigate('meeting-detail', { id: meeting.id })}
                  >
                    <div className="meeting-item-icon">
                      <FileAudio size={20} />
                    </div>
                    <div className="meeting-item-details">
                      <span className="meeting-item-title">{meeting.title}</span>
                      <div className="meeting-item-sub">
                        <span>{new Date(meeting.upload_date).toLocaleDateString()}</span>
                        <span className="separator-dot">&bull;</span>
                        <span>{formatDuration(meeting.duration_seconds)}</span>
                        <span className="separator-dot">&bull;</span>
                        <span className="file-type-badge">{meeting.file_type.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="meeting-item-status-wrapper">
                      <span className={`badge badge-${meeting.processing_status.toLowerCase()}`}>
                        {meeting.processing_status}
                      </span>
                      <ArrowRight size={16} className="arrow-hover" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          <div className="glass-card analytics-summary-card">
            <div className="card-header-with-action">
              <h3>Upload Summary</h3>
              <BarChart3 size={18} className="icon-text-muted" />
            </div>
            
            <div className="analytics-body">
              <div className="upload-stat-item">
                <span className="stat-label">Uploaded Today</span>
                <span className="stat-count">{stats?.meetings_uploaded_today ?? 0}</span>
              </div>
              <div className="upload-stat-item">
                <span className="stat-label">This Week</span>
                <span className="stat-count">{stats?.meetings_uploaded_this_week ?? 0}</span>
              </div>
              <div className="upload-stat-item">
                <span className="stat-label">This Month</span>
                <span className="stat-count">{stats?.meetings_uploaded_this_month ?? 0}</span>
              </div>
              
              <div className="divider" style={{ margin: '1.5rem 0' }}></div>
              
              <div className="analytics-metrics-list">
                <div className="metric-row">
                  <Clock size={16} className="icon-text-muted" />
                  <div className="metric-row-data">
                    <span className="metric-row-label">Avg Duration</span>
                    <span className="metric-row-value">{formatDuration(stats?.average_meeting_duration)}</span>
                  </div>
                </div>
                
                <div className="metric-row" style={{ marginTop: '1.25rem' }}>
                  <Activity size={16} className="icon-text-muted" />
                  <div className="metric-row-data">
                    <span className="metric-row-label">Avg AI Pipeline Time</span>
                    <span className="metric-row-value">
                      {stats?.average_processing_time ? `${Math.round(stats.average_processing_time)}s` : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card helpful-tips-card" style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'white' }}>Quick Instructions</h4>
            <ul className="helpful-tips-list">
              <li>
                <strong>Upload & Forget:</strong> Transcriptions run asynchronously in background pipelines.
              </li>
              <li>
                <strong>AI Chatbot:</strong> Inside meeting details, ask questions directly targeting the transcript text context.
              </li>
              <li>
                <strong>Reports Download:</strong> Export completed meetings to TXT, JSON, or professional PDF summaries.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
