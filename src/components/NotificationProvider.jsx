import { createContext, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setNotifications((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, duration);
  };

  const value = useMemo(() => ({ showNotification }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-root" aria-live="polite" aria-atomic="true">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
