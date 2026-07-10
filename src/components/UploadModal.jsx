import { useState, useRef } from 'react';
import { api } from '../services/api';
import { X, Upload, FileAudio, AlertCircle, CheckCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    setError(null);
    
    // Check size (500MB)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError('File is too large. Maximum size allowed is 500MB.');
      return;
    }

    setFile(selectedFile);
    
    // Set initial title from file name (without extension)
    const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
    // Normalize string (remove dashes, underscores, capitalize)
    const normalizedTitle = fileNameWithoutExt
      .replace(/[_-]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    setTitle(normalizedTitle);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Please select a file and enter a meeting title.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.meetings.upload(title.trim(), file);
      if (res.success && res.data) {
        setSuccess(true);
        setTimeout(() => {
          onUploadSuccess(res.data);
          handleClose();
        }, 1500);
      } else {
        throw new Error(res.message || 'Upload failed.');
      }
    } catch (err) {
      setError(err.message || 'Error uploading file. Make sure it is a supported audio/video format.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setFile(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="font-display">Upload Meeting Recording</h3>
          <button className="modal-close-btn btn-ghost" onClick={handleClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success animate-fade-in">
                <CheckCircle size={18} />
                <span>Meeting uploaded successfully! Initializing pipelines...</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            {!file ? (
              <div 
                className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="audio/*,video/*"
                />
                <div className="upload-icon-wrapper">
                  <Upload size={32} />
                </div>
                <p className="upload-text-main">Drag and drop your audio/video recording here</p>
                <p className="upload-text-sub">or click to browse your local files</p>
                <p className="upload-text-limits">Supports MP3, WAV, M4A, MP4 (Max 500MB)</p>
              </div>
            ) : (
              <div className="file-info-card animate-fade-in">
                <div className="file-info-icon">
                  <FileAudio size={28} />
                </div>
                <div className="file-info-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                </div>
                <button 
                  type="button" 
                  className="file-remove-btn" 
                  onClick={() => setFile(null)} 
                  disabled={loading}
                >
                  Change
                </button>
              </div>
            )}

            {/* Title Input */}
            {file && (
              <div className="form-group animate-fade-in" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" htmlFor="meetingTitle">Meeting Title</label>
                <input 
                  type="text" 
                  id="meetingTitle" 
                  className="form-input" 
                  placeholder="Enter meeting title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  maxLength={255}
                  required
                />
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !file || !title.trim() || success}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload & Analyze</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
