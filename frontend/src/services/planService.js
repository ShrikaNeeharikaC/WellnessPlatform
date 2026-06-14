import api from './api';

const planService = {
  async getPlans()          { return (await api.get('/plans')).data; },
  async getPlan(id)         { return (await api.get(`/plans/${id}`)).data; },
  async createPlan(data)    { return (await api.post('/plans', data)).data; },
  async updatePlan(id, data){ return (await api.put(`/plans/${id}`, data)).data; },
  async deletePlan(id)      { await api.delete(`/plans/${id}`); },

  async assignPlan(planId)   { return (await api.post('/user-plan', { plan_id: planId })).data; },
  async getActivePlan()      { return (await api.get('/user-plan/active')).data; },
  async getPlanHistory()     { return (await api.get('/user-plan/history')).data; },
};

export default planService;
