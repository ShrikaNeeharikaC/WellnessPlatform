import api from './api';

const appointmentService = {
  getMyAppointments: () =>
    api.get('/appointments').then((r) => r.data),

  cancelAppointment: (id) =>
    api.delete(`/appointments/${id}`).then((r) => r.data),

  sendChatMessage: (message) =>
    api.post('/chat/appointment', { message }).then((r) => r.data),

  assignCoach: (coachId) =>
    api.post(`/appointments/assign-coach/${coachId}`).then((r) => r.data),
};

export default appointmentService;
