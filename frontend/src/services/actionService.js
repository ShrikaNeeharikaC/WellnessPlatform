import api from './api';

const actionService = {
  async getActions({ week, year, category } = {}) {
    const params = {};
    if (week)     params.week     = week;
    if (year)     params.year     = year;
    if (category) params.category = category;
    return (await api.get('/actions', { params })).data;
  },
  async createAction(data)         { return (await api.post('/actions', data)).data; },
  async updateAction(id, data)     { return (await api.put(`/actions/${id}`, data)).data; },
  async completeAction(id)         { return actionService.updateAction(id, { status: 'completed' }); },
  async deleteAction(id)           { await api.delete(`/actions/${id}`); },
};

export default actionService;
