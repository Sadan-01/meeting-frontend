const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = { ...options.headers };
  
  // Get token
  const token = localStorage.getItem('meetmind_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Default JSON content-type unless we are uploading files
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Check for token expiration / unauthorized
    if (response.status === 401) {
      localStorage.removeItem('meetmind_token');
      localStorage.removeItem('meetmind_user');
      window.dispatchEvent(new Event('auth_session_expired'));
    }
    
    // For exports/file downloads, return blob
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && (
      contentType.includes('application/pdf') || 
      contentType.includes('text/plain') || 
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/json') && endpoint.includes('/export/')
    )) {
      const blob = await response.blob();
      const filenameHeader = response.headers.get('content-disposition');
      let filename = 'download';
      if (filenameHeader) {
        const matches = /filename="([^"]+)"/.exec(filenameHeader);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      return { blob, filename };
    }
    
    let responseData = null;
    try {
      responseData = await response.json();
    } catch {
      // Not JSON
    }
    
    if (!response.ok) {
      const errorMsg = responseData?.message || responseData?.detail || `API request failed with status ${response.status}`;
      throw new APIError(errorMsg, response.status, responseData);
    }
    
    return responseData;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(error.message || 'Network request failed');
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data?.access_token) {
        localStorage.setItem('meetmind_token', res.data.access_token);
        localStorage.setItem('meetmind_user', JSON.stringify(res.data.user));
      }
      return res;
    },
    register: async (fullName, email, password, confirmPassword) => {
      return request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });
    },
    me: async () => {
      return request('/api/auth/me');
    },
    updateProfile: async (fullName) => {
      const res = await request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName }),
      });
      if (res.success && res.data) {
        localStorage.setItem('meetmind_user', JSON.stringify(res.data));
      }
      return res;
    },
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
      return request('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
    },
    logout: () => {
      localStorage.removeItem('meetmind_token');
      localStorage.removeItem('meetmind_user');
    }
  },
  
  dashboard: {
    getOverview: async () => {
      return request('/api/dashboard/overview');
    },
    getRecent: async (limit = 10) => {
      return request(`/api/dashboard/recent?limit=${limit}`);
    },
    getAnalytics: async () => {
      return request('/api/dashboard/analytics');
    },
    search: async (keyword, page = 1, pageSize = 20) => {
      return request(`/api/dashboard/search?keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=${pageSize}`);
    },
    listMeetings: async (params = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      const queryString = queryParams.toString();
      return request(`/api/dashboard/meetings${queryString ? `?${queryString}` : ''}`);
    }
  },
  
  meetings: {
    upload: async (title, file) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      return request('/api/meetings/upload', {
        method: 'POST',
        body: formData,
      });
    },
    list: async (page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc') => {
      return request(`/api/meetings?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`);
    },
    get: async (id) => {
      return request(`/api/meetings/${id}`);
    },
    delete: async (id) => {
      return request(`/api/meetings/${id}`, {
        method: 'DELETE',
      });
    },
    process: async (id) => {
      return request(`/api/meetings/${id}/process`, {
        method: 'POST',
      });
    },
    startProcessing: async (id) => {
      return request(`/api/meetings/${id}/start-processing`, {
        method: 'POST',
      });
    },
    getStatus: async (id) => {
      return request(`/api/meetings/${id}/status`);
    },
    getTranscript: async (id) => {
      return request(`/api/meetings/${id}/transcript`);
    },
    analyze: async (id) => {
      return request(`/api/meetings/${id}/analyze`, {
        method: 'POST',
      });
    },
    getSummary: async (id) => {
      return request(`/api/meetings/${id}/summary`);
    },
    chat: async (id, message) => {
      return request(`/api/meetings/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    getChatHistory: async (id) => {
      return request(`/api/meetings/${id}/chat/history`);
    },
    deleteChatHistory: async (id) => {
      return request(`/api/meetings/${id}/chat/history`, {
        method: 'DELETE',
      });
    },
    exportPdf: async (id) => {
      return request(`/api/meetings/${id}/export/pdf`);
    },
    exportTxt: async (id) => {
      return request(`/api/meetings/${id}/export/txt`);
    },
    exportJson: async (id) => {
      return request(`/api/meetings/${id}/export/json`);
    }
  }
};
