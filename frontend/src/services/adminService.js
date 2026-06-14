import api from './api';

const adminService = {
  async getUsers(skip = 0, limit = 100)    { return (await api.get('/admin/users', { params: { skip, limit } })).data; },
  async getUser(id)                        { return (await api.get(`/admin/users/${id}`)).data; },
  async updateUser(id, data)               { return (await api.put(`/admin/users/${id}`, data)).data; },
  async getReports()                       { return (await api.get('/admin/reports/summary')).data; },
  async getCoachMembers()                  { return (await api.get('/coach/members')).data; },
  async getMember(id)                      { return (await api.get(`/admin/users/${id}`)).data; },
  async getMemberCheckins(memberId)        { return (await api.get(`/coach/members/${memberId}/checkins`)).data; },
  async reviewCheckin(checkinId, data)     { return (await api.put(`/coach/checkins/${checkinId}/review`, data)).data; },
  async getSummary()                       { return (await api.get('/admin/reports/summary')).data; },
};

export default adminService;
