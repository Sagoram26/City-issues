import api from './api';

const issueService = {
  // Get all issues with optional filters
  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // Get single issue by ID
  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // Create a new issue
  createIssue: async (issueData) => {
    // Use FormData for file upload
    const formData = new FormData();
    
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('latitude', issueData.latitude);
    formData.append('longitude', issueData.longitude);
    
    if (issueData.address) {
      formData.append('address', issueData.address);
    }
    
    if (issueData.category) {
      formData.append('category', issueData.category);
    }
    
    if (issueData.photo) {
      formData.append('photo', issueData.photo);
    }

    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Vote on an issue
  voteIssue: async (id) => {
    const response = await api.post(`/issues/${id}/vote`);
    return response.data;
  },

  // Update issue status (admin only)
  updateIssueStatus: async (id, status) => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },

  // Delete an issue
  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  }
};

export default issueService;
