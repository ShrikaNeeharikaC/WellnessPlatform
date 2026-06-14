import api from './api';

const checkinService = {
  async submit(data)          { return (await api.post('/checkins', data)).data; },
  async getHistory()          { return (await api.get('/checkins')).data; },
  async getCheckin(id)        { return (await api.get(`/checkins/${id}`)).data; },

  // Coach only
  async getMemberCheckins(memberId)        { return (await api.get(`/coach/members/${memberId}/checkins`)).data; },
  async reviewCheckin(id, coach_notes)     { return (await api.put(`/coach/checkins/${id}/review`, { coach_notes })).data; },
};

export default checkinService;
