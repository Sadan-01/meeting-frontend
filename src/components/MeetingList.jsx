import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileAudio, Search, Filter, SortAsc, LayoutGrid, List, ChevronLeft, ChevronRight, Upload, Calendar, Clock, RefreshCw } from 'lucide-react';

export default function MeetingList({ onNavigate, onOpenUpload }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination State
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // UI states
  const [isGridView, setIsGridView] = useState(true);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      setError(null);
      // Map sort string to what backend expects
      let backendSortBy = 'created_at';
      if (sortBy === 'title') backendSortBy = 'title';
      else if (sortBy === 'duration') backendSortBy = 'duration';
      else if (sortBy === 'processing_status') backendSortBy = 'processing_status';
      
      const sortOrder = sortBy === 'oldest' ? 'asc' : 'desc';
      if (sortBy === 'oldest') backendSortBy = 'created_at';

      const res = await api.dashboard.listMeetings({
        keyword: keyword.trim() || undefined,
        processing_status: status || undefined,
        sort_by: sortBy,
        page,
        page_size: 12,
      });

      if (res.success && res.data) {
        setMeetings(res.data.results || []);
        setTotalPages(res.data.pagination?.total_pages || 1);
        setTotalRecords(res.data.pagination?.total_records || 0);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve meetings list. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, status, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMeetings();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatus('');
    setSortBy('newest');
    setPage(1);
    // Since state updates are async, trigger fetch directly with cleared params
    setTimeout(() => {
      fetchMeetings();
    }, 0);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="meetings-view animate-fade-in">
      {/* Top Header */}
      <div className="view-header">
        <div>
          <h1 className="font-display">Meeting Repository</h1>
          <p className="welcome-sub">Manage, filter, and review all uploaded meeting audio files.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={18} />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card toolbar-card">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="toolbar-search">
            <Search size={18} className="input-search-icon" />
            <input
              type="text"
              placeholder="Search by title..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input search-form-input"
            />
          </div>
          
          <div className="toolbar-filters">
            <div className="filter-select-wrapper">
              <Filter size={14} className="select-icon" />
              <select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="form-input select-input"
              >
                <option value="">All Statuses</option>
                <option value="UPLOADED">Uploaded</option>
                <option value="QUEUED">Queued</option>
                <option value="PROCESSING">Processing</option>
                <option value="TRANSCRIBED">Transcribed</option>
                <option value="ANALYZING">Analyzing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="filter-select-wrapper">
              <SortAsc size={14} className="select-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="form-input select-input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical (Title)</option>
                <option value="duration">Duration</option>
                <option value="processing_status">Status</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-secondary">Search</button>
            <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>Reset</button>
          </div>
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${isGridView ? 'active' : ''}`}
              onClick={() => setIsGridView(true)}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${!isGridView ? 'active' : ''}`}
              onClick={() => setIsGridView(false)}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: '1.5rem 0' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid/List View Body */}
      {loading ? (
        <div className="center-container">
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Retrieving your workspace...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="glass-card empty-state-card animate-fade-in">
          <FileAudio size={48} className="empty-icon-large" />
          <h3>No Meetings Found</h3>
          <p>We couldn't find any meetings matching your criteria. Try adjusting your search query or filters.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={onOpenUpload}>
            Upload a File
          </button>
        </div>
      ) : isGridView ? (
        /* Grid Layout */
        <div className="grid-cols-3 animate-fade-in">
          {meetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className="glass-card glass-card-hover meeting-card-grid"
              onClick={() => onNavigate('meeting-detail', { id: meeting.id })}
            >
              <div className="grid-card-header">
                <span className={`badge badge-${meeting.processing_status.toLowerCase()}`}>
                  {meeting.processing_status}
                </span>
                <span className="grid-card-ext">{meeting.file_type.toUpperCase()}</span>
              </div>
              
              <h3 className="grid-card-title">{meeting.title}</h3>
              
              <div className="grid-card-details">
                <div className="detail-item">
                  <Calendar size={14} />
                  <span>{new Date(meeting.upload_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{formatDuration(meeting.duration_seconds)}</span>
                </div>
              </div>
              
              <div className="grid-card-footer">
                <span className="grid-card-size">{formatBytes(meeting.file_size || 0)}</span>
                {meeting.processing_status === 'PROCESSING' || meeting.processing_status === 'ANALYZING' ? (
                  <div className="progress-mini-bar">
                    <div className="progress-mini-fill" style={{ width: `${meeting.processing_progress || 10}%` }}></div>
                  </div>
                ) : (
                  <div className="action-hover-trigger">
                    Open Insights &rarr;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table Layout */
        <div className="glass-card list-view-container animate-fade-in">
          <table className="meetings-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Upload Date</th>
                <th>Duration</th>
                <th>File Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} onClick={() => onNavigate('meeting-detail', { id: meeting.id })}>
                  <td className="table-title-cell">
                    <FileAudio size={16} className="table-icon" />
                    <span>{meeting.title}</span>
                  </td>
                  <td>{new Date(meeting.upload_date).toLocaleDateString()}</td>
                  <td>{formatDuration(meeting.duration_seconds)}</td>
                  <td>{formatBytes(meeting.file_size)}</td>
                  <td>
                    <span className={`badge badge-${meeting.processing_status.toLowerCase()}`}>
                      {meeting.processing_status}
                    </span>
                  </td>
                  <td className="table-action-cell">
                    <button className="btn-table-action">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container animate-fade-in">
          <button 
            className="btn btn-secondary btn-pagination" 
            onClick={() => setPage(p => Math.max(p - 1, 1))} 
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button 
                key={p} 
                className={`page-number-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-secondary btn-pagination" 
            onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
            disabled={page === totalPages || loading}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
