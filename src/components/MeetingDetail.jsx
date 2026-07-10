import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  ChevronLeft, FileText, CheckSquare, MessageSquare, 
  Download, Trash2, ArrowRight, Play, RefreshCw, 
  Search, Users, Calendar,  Clock,  AlertTriangle, Send, ShieldAlert, CheckCircle2
} from 'lucide-react';

export default function MeetingDetail({ meetingId, onNavigate }) {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Status and Polling State
  const [polling, setPolling] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);

  // Tabs state: 'summary' | 'actions' | 'transcript'
  const [activeTab, setActiveTab] = useState('summary');
  
  // Transcript search
  const [transcriptSearch, setTranscriptSearch] = useState('');
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const chatBottomRef = useRef(null);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Detail and status fetching
  const fetchDetails = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      setError(null);
      const res = await api.meetings.get(meetingId);
      if (res.success && res.data) {
        let currentMeetingData = res.data;
        
        // Auto-trigger background processing if meeting is UPLOADED
        if (currentMeetingData.processing_status === 'UPLOADED') {
          try {
            api.meetings.startProcessing(meetingId).catch(err => {
              console.error("Auto-start processing failed:", err);
            });
            // Update status and progress locally so the loader displays immediately
            currentMeetingData = {
              ...currentMeetingData,
              processing_status: 'QUEUED',
              processing_progress: 5
            };
          } catch (err) {
            console.error("Failed to initiate processing:", err);
          }
        }

        setMeeting(currentMeetingData);
        console.log("Meeting received:", currentMeetingData);
        setPipelineProgress(currentMeetingData.processing_progress || 0);
        
        // Start polling if not completed/failed
        const status = currentMeetingData.processing_status;
        if (status !== 'COMPLETED' && status !== 'FAILED') {
          setPolling(true);
        } else {
          setPolling(false);
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve meeting insights.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchChat = async () => {
    try {
      const res = await api.meetings.getChatHistory(meetingId);
      if (res.success && res.data) {
        console.log("Chat history response:", res);

const history =
  Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.messages)
      ? res.data.messages
      : [];

setChatHistory(history);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    fetchDetails(true);
    fetchChat();
  }, [meetingId]);

  // Polling Effect
  useEffect(() => {
    let intervalId;
    if (polling) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.meetings.getStatus(meetingId);
          if (res.success && res.data) {
            const status = res.data.processing_status;
            setPipelineProgress(res.data.processing_progress);
            
            if (status === 'COMPLETED' || status === 'FAILED') {
              setPolling(false);
              fetchDetails(false); // Refresh whole object
            } else {
              // Update status in local state
              setMeeting(prev => prev ? { 
                ...prev, 
                processing_status: status, 
                processing_progress: res.data.processing_progress 
              } : null);
            }
          }
        } catch (err) {
          console.error('Polling status failed:', err);
        }
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, meetingId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  const handleStartProcessing = async () => {
    try {
      setError(null);
      const res = await api.meetings.startProcessing(meetingId);
      if (res.success) {
        setPolling(true);
        setMeeting(prev => prev ? { 
          ...prev, 
          processing_status: res.data.processing_status,
          processing_progress: res.data.processing_progress 
        } : null);
      }
    } catch (err) {
      setError(err.message || 'Failed to start meeting processing.');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this meeting? This will delete all files, transcripts, analyses, and chat histories.')) {
      return;
    }

    try {
      const res = await api.meetings.delete(meetingId);
      if (res.success) {
        onNavigate('meetings');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDownload = async (format) => {
    setShowExportMenu(false);
    try {
      let res;
      if (format === 'pdf') res = await api.meetings.exportPdf(meetingId);
      else if (format === 'txt') res = await api.meetings.exportTxt(meetingId);
      else if (format === 'json') res = await api.meetings.exportJson(meetingId);
      
      if (res && res.blob) {
        const url = window.URL.createObjectURL(res.blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.filename || `meeting_${meetingId}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Export download failed: ' + err.message);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Optimistic UI update
    const tempUserMsgObj = {
      id: Date.now(),
      role: 'user',
      message: userMessage,
      created_at: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, tempUserMsgObj]);
    
    setChatLoading(true);
    try {
      const res = await api.meetings.chat(meetingId, userMessage);
      if (res.success && res.data) {
    const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        message: res.data.answer,
        created_at: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, assistantMessage]);
} else {
        throw new Error(res.message);
      }
    } catch (err) {
      // Add error message to history
      const tempErrorMsgObj = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'Sorry, I couldn\'t process that question. Please make sure the meeting is processed and try again.',
        created_at: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, tempErrorMsgObj]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChatHistory = async () => {
    if (!window.confirm('Delete all messages in this chat session?')) return;
    try {
      const res = await api.meetings.deleteChatHistory(meetingId);
      if (res.success) {
        setChatHistory([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const highlightText = (text, search) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className="highlight">{part}</mark> 
            : part
        )}
      </span>
    );
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

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner spinner-lg"></div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Extracting meeting intelligence...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="view-container animate-fade-in" style={{ padding: '2.5rem 2rem' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('meetings')} style={{ marginBottom: '2rem' }}>
          <ChevronLeft size={16} />
          <span>Back to Repository</span>
        </button>
        <div className="glass-card empty-state-card">
          <ShieldAlert size={48} className="empty-icon-large" style={{ color: 'var(--error)' }} />
          <h3>Error Loading Meeting</h3>
          <p>{error || 'The requested meeting could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  const status = meeting.processing_status;

  return (
    <div className="meeting-detail-view animate-fade-in">
      {/* Workspace Header */}
      <div className="detail-header">
        <div className="header-meta">
          <button className="btn-back btn-ghost" onClick={() => onNavigate('meetings')}>
            <ChevronLeft size={20} />
            <span>Repository</span>
          </button>
          
          <div className="header-meta-details">
            <h1 className="font-display">{meeting.title}</h1>
            <div className="header-meta-subs">
              <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
              <span className="separator-dot">&bull;</span>
              <span className="meta-sub-item"><Calendar size={14} /> {new Date(meeting.created_at).toLocaleDateString()}</span>
              <span className="separator-dot">&bull;</span>
              <span className="meta-sub-item"><Clock size={14} /> {formatDuration(meeting.duration_seconds)}</span>
              <span className="separator-dot">&bull;</span>
              <span className="meta-sub-item">{formatBytes(meeting.file_size)} ({meeting.file_extension.toUpperCase()})</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Export Dropdown */}
          {status === 'COMPLETED' && (
            <div className="export-dropdown-wrapper">
              <button className="btn btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                <Download size={16} />
                <span>Export Insights</span>
              </button>
              {showExportMenu && (
                <div className="export-menu glass-card">
                  <button onClick={() => handleDownload('pdf')}>PDF Summary Document</button>
                  <button onClick={() => handleDownload('txt')}>Clean Text Document</button>
                  <button onClick={() => handleDownload('json')}>Structured JSON Data</button>
                </div>
              )}
            </div>
          )}

          {/* Delete Action */}
          <button className="btn btn-danger btn-icon-only" onClick={handleDeleteMeeting} title="Delete Meeting">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className={`workspace-layout ${chatCollapsed ? 'chat-collapsed' : ''}`}>
        
        {/* Left Pane: Summary / Transcript */}
        <div className="workspace-left-pane glass-card">
          
          {/* Pipeline Not Processed State */}
          {status === 'UPLOADED' && (
            <div className="pipeline-state-panel empty-state">
              <Play size={48} className="pipeline-state-icon text-accent" />
              <h3>Ready for AI Analysis</h3>
              <p>Analyze the recording transcript to extract summaries, key decisions, action items, and activate the chat assistant.</p>
              <button className="btn btn-primary" onClick={handleStartProcessing}>
                <Play size={16} fill="white" />
                <span>Run Processing Pipeline</span>
              </button>
            </div>
          )}

          {/* Pipeline Loading / Processing State */}
          {(status === 'QUEUED' || status === 'PROCESSING' || status === 'TRANSCRIBED' || status === 'ANALYZING') && (
            <div className="pipeline-state-panel empty-state">
              <RefreshCw size={48} className="pipeline-state-icon spinner text-accent" />
              <h3>Processing AI Pipelines</h3>
              <p>MeetMind AI is parsing your audio recording, transcribing conversation, separating speakers, and extracting executive intelligence.</p>
              <div className="pipeline-progress-container" style={{ width: '100%', maxWidth: '350px', marginTop: '1.5rem' }}>
                <div className="pipeline-progress-bar-container">
                  <div className="pipeline-progress-bar" style={{ width: `${pipelineProgress || 10}%` }}></div>
                </div>
                <div className="pipeline-progress-percentage" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {status} &bull; {pipelineProgress || 10}% Complete
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Failed State */}
          {status === 'FAILED' && (
            <div className="pipeline-state-panel empty-state">
              <AlertTriangle size={48} className="pipeline-state-icon" style={{ color: 'var(--error)' }} />
              <h3>AI Processing Pipeline Failed</h3>
              <p>An unexpected error occurred during audio processing. Make sure the uploaded file is not corrupted and contains vocal conversations.</p>
              <button className="btn btn-secondary" onClick={handleStartProcessing}>
                <RefreshCw size={16} />
                <span>Retry Processing</span>
              </button>
            </div>
          )}

          {/* Pipeline Completed State (Actual Tabs) */}
          {status === 'COMPLETED' && (
            <>
              {/* Tab Navigation */}
              <div className="pane-tabs-header">
                <button 
                  className={`pane-tab ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  <FileText size={16} />
                  <span>Executive Insights</span>
                </button>
                <button 
                  className={`pane-tab ${activeTab === 'actions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('actions')}
                >
                  <CheckSquare size={16} />
                  <span>Action Items</span>
                </button>
                <button 
                  className={`pane-tab ${activeTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transcript')}
                >
                  <MessageSquare size={16} />
                  <span>Meeting Transcript</span>
                </button>
              </div>

              {/* Tab Content Panel */}
              <div className="pane-tab-body">
                
                {/* 1. Summary Tab */}
                {activeTab === 'summary' && (
                  <div className="summary-tab-content animate-fade-in">
                    
                    {/* Executive Summary */}
                    {meeting.executive_summary && (
                      <div className="summary-section">
                        <h4>Executive Summary</h4>
                        <p className="summary-paragraph">{meeting.executive_summary}</p>
                      </div>
                    )}

                    {/* Participants Tagging */}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="summary-section">
                        <h4>Participants</h4>
                        <div className="participants-tags">
                          {meeting.participants.map((p, idx) => (
                            <span key={idx} className="participant-tag">
                              <Users size={12} />
                              <span>{p}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="divider" style={{ margin: '1.5rem 0' }}></div>

                    {/* Core Lists */}
                    <div className="grid-cols-2">
                      {/* Key Points */}
                      {meeting.key_points && meeting.key_points.length > 0 && (
                        <div className="summary-section">
                          <h4>Key Takeaways</h4>
                          <ul className="bullet-insights-list">
                            {meeting.key_points.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Key Decisions */}
                      {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                        <div className="summary-section">
                          <h4>Key Decisions</h4>
                          <ul className="bullet-insights-list decisions-list">
                            {meeting.key_decisions.map((decision, idx) => (
                              <li key={idx}>{decision}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="divider" style={{ margin: '1.5rem 0' }}></div>

                    <div className="grid-cols-2">
                      {/* Risks */}
                      {meeting.risks && meeting.risks.length > 0 && (
                        <div className="summary-section">
                          <h4>Risks & Blockers</h4>
                          <ul className="bullet-insights-list risks-list">
                            {meeting.risks.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Steps */}
                      {meeting.next_steps && meeting.next_steps.length > 0 && (
                        <div className="summary-section">
                          <h4>Next Steps</h4>
                          <ul className="bullet-insights-list next-steps-list">
                            {meeting.next_steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Action Items Tab */}
                {activeTab === 'actions' && (
                  <div className="actions-tab-content animate-fade-in">
                    {(!meeting.deadlines || meeting.deadlines.length === 0) ? (
                      <div className="empty-tab-state">
                        <CheckSquare size={36} className="empty-tab-icon" />
                        <p>No action items or milestones extracted from this meeting.</p>
                      </div>
                    ) : (
                      <div className="action-items-timeline">
                        {meeting.deadlines.map((item, idx) => (
                          <div key={idx} className="action-item-card glass-card">
                            <div className="action-item-check-icon">
                              <CheckSquare size={20} className="text-accent" />
                            </div>
                            <div className="action-item-card-body">
                              <p className="action-task-desc">{item.item || item.task}</p>
                              
                              <div className="action-meta-row">
                                <span className="action-assignee">
                                  <Users size={12} />
                                  <span>{item.owner || item.assignee || 'Unassigned'}</span>
                                </span>
                                {item.deadline && (
                                  <span className="action-deadline">
                                    <Calendar size={12} />
                                    <span>
                                      {typeof item.deadline === 'string' 
                                        ? item.deadline 
                                        : new Date(item.deadline).toLocaleDateString()}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="transcript-tab-content animate-fade-in">
                    {/* Search Panel */}
                    <div className="transcript-search-bar">
                      <Search size={16} className="t-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search transcript conversation..."
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        className="form-input search-form-input"
                      />
                    </div>
                    
                    {/* Transcript scrolling text */}
                    <div className="transcript-scroll-area">
                      {meeting.transcript ? (
                        <div className="transcript-paragraphs-wrapper">
                          {meeting.transcript.split('\n\n').map((para, idx) => {
                            // Check if paragraphs are speaker formatted, e.g. "Speaker 1: Hello..."
                            const speakerMatches = para.match(/^([^:]+):/);
                            if (speakerMatches) {
                              const speaker = speakerMatches[1];
                              const text = para.substring(speaker.length + 1).trim();
                              return (
                                <div key={idx} className="transcript-para-block">
                                  <span className="transcript-speaker">{speaker}</span>
                                  <p className="transcript-text">{highlightText(text, transcriptSearch)}</p>
                                </div>
                              );
                            }
                            
                            return (
                              <p key={idx} className="transcript-raw-para">
                                {highlightText(para, transcriptSearch)}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-tab-state">
                          <p>Transcript file is empty or could not be formatted.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

        </div>

        {/* Right Pane: AI Chatbot Panel */}
        {status === 'COMPLETED' && (
          <div className="workspace-right-pane glass-card">
            
            {/* Header info */}
            <div className="chat-pane-header">
              <div className="chat-header-main">
                <MessageSquare size={16} className="text-accent" />
                <h3>Meeting Assistant</h3>
              </div>
              <div className="chat-header-actions">
                {Array.isArray(chatHistory) && chatHistory.length > 0 && (
                  <button className="chat-clear-btn" onClick={handleClearChatHistory} title="Clear Chat History">
                    Clear Chat
                  </button>
                )}
                <button className="chat-collapse-btn btn-ghost" onClick={() => setChatCollapsed(!chatCollapsed)}>
                  {chatCollapsed ? 'Expand Assistant &rarr;' : '&larr; Collapse'}
                </button>
              </div>
            </div>

            {/* Scrolling Chat history */}
            <div className="chat-messages-area">
              {!Array.isArray(chatHistory) || chatHistory.length === 0 ? (
                <div className="chat-empty-state">
                  <MessageSquare size={36} className="chat-empty-icon text-muted" />
                  <h4>Ask MeetMind AI</h4>
                  <p>Ask specific questions regarding this meeting. The AI will answer referencing only this meeting's context.</p>
                  <div className="chat-suggested-prompts">
                    <button onClick={() => setChatInput('What were the key decisions made in this meeting?')}>
                      "What decisions were made?"
                    </button>
                    <button onClick={() => setChatInput('List all the action items along with their deadlines.')}>
                      "List action items & deadlines"
                    </button>
                    <button onClick={() => setChatInput('Were there any project risks identified? If so, what?')}>
                      "Were there any risks?"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-messages-list">
                  {(Array.isArray(chatHistory) ? chatHistory : []).map((msg) => (
                    <div key={msg.id} className={`chat-message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                      <div className="chat-bubble-sender">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className="chat-bubble-text">
                        {msg.message}
                      </div>
                      <div className="chat-bubble-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  
                  {chatLoading && (
                    <div className="chat-message-bubble assistant-bubble loading-bubble">
                      <div className="chat-bubble-sender">Assistant</div>
                      <div className="chat-bubble-text">
                        <div className="typing-loader">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef}></div>
                </div>
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChatMessage} className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Ask a question about this meeting..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="form-input chat-input-field"
              />
              <button type="submit" className="btn btn-primary chat-send-btn" disabled={!chatInput.trim() || chatLoading}>
                <Send size={14} />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
