import api from './api';

const notificationService = {
  async getAll(skip = 0, limit = 50)     { return (await api.get('/notifications', { params: { skip, limit } })).data; },
  async getSummary()                     { return (await api.get('/notifications/summary')).data; },
  async markRead(ids)                    { return (await api.put('/notifications/read', { notification_ids: ids })).data; },
  async markAllRead()                    { return (await api.put('/notifications/read-all')).data; },
};

export default notificationService;
