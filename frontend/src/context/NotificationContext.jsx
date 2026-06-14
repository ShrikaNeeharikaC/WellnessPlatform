import React, { createContext, useState, useCallback, useContext } from 'react';
import notificationService from '../services/notificationService';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [summary, setSummary] = useState({ total_unread: 0 });

  const refreshSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const s = await notificationService.getSummary();
      setSummary(s);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ summary, refreshSummary }}>
      {children}
    </NotificationContext.Provider>
  );
}
