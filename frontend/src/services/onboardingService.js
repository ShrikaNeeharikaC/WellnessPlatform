import api from './api';

const onboardingService = {
  async get()                     { return (await api.get('/onboarding')).data; },
  async updateStep(step, data, gdpr_consent) {
    return (await api.post('/onboarding/step', { step, data, gdpr_consent })).data;
  },
  async complete()                { return (await api.post('/onboarding/complete')).data; },
};

export default onboardingService;
