import React, { createContext, useContext, useRef, useState } from "react";
import { NotificationLevel, NotificationPayload } from "../../Constants";
import Icon from "../../utils/svgUtils";

interface Notification {
  id: number;
  level: NotificationLevel;
  heading?: string;
  text?: string;
}

interface NotificationContextType {
  showNotification: (notification: NotificationPayload) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeout = useRef<number>();

  const showNotification = (notification: NotificationPayload) => {
    const newNotification: Notification = {
      id: Date.now(),
      level: notification.level,
      heading: notification.title,
      text: notification.text,
    };
    setNotifications(prev => {
      const itemExists = prev.some(item => item.id === newNotification.id);
      return itemExists ? prev : [...prev, newNotification];
    });

    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      setNotifications([]);
    }, 5000)
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="position-fixed top-0 p-2 w-100" style={{ zIndex: 1050 }}>
        {notifications.map((notification) => (
          <div key={notification.id} className={`alert alert-dismissible d-flex align-items-center gap-2 fade show p-2 ${notification.level}`} role="alert">
            <Icon name={notification.level.replace('-', '_')} color="currentColor" />
            <div className="mt-2">
              <strong><span>{notification.heading}</span></strong>
              <p className="ms-1"><span>{notification.text}</span></p>
            </div>
            <button type="button" className="btn-close" onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}></button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
