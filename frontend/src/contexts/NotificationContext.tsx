import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'NEW_LOAN_APPLICATION' | 'LOAN_STATUS_UPDATE' | 'SYSTEM_NOTIFICATION';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pendingLoanCount: number;
  socket: Socket | null;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Calculate pending loan count (new loan applications)
  const pendingLoanCount = notifications.filter(n => 
    n.type === 'NEW_LOAN_APPLICATION' && !n.isRead
  ).length;

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = () => {
      const newSocket = io('http://localhost:3000/admin', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        
        // Join admin room
        newSocket.emit('joinAdminRoom');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      // Listen for new loan application notifications
      newSocket.on('newLoanApplication', (data) => {
        console.log('Received new loan application notification:', data);
        
        const notification: Notification = {
          id: `loan_${data.data.loanApplicationId}_${Date.now()}`,
          type: 'NEW_LOAN_APPLICATION',
          title: 'Hợp đồng vay mới',
          message: `${data.data.fullName} đã tạo hợp đồng vay ${data.data.loanAmount.toLocaleString()} VND`,
          data: data.data,
          timestamp: data.timestamp,
          isRead: false,
        };

        addNotification(notification);
      });

      // Listen for loan status updates
      newSocket.on('loanStatusUpdate', (data) => {
        console.log('Received loan status update notification:', data);
        
        const notification: Notification = {
          id: `status_${data.data.loanApplicationId}_${Date.now()}`,
          type: 'LOAN_STATUS_UPDATE',
          title: 'Cập nhật trạng thái khoản vay',
          message: `Khoản vay ${data.data.loanApplicationId} đã được cập nhật trạng thái`,
          data: data.data,
          timestamp: data.timestamp,
          isRead: false,
        };

        addNotification(notification);
      });

      // Listen for admin connection events
      newSocket.on('adminConnected', (data) => {
        console.log('Admin connected:', data);
      });

      newSocket.on('adminDisconnected', (data) => {
        console.log('Admin disconnected:', data);
      });

      setSocket(newSocket);
    };

    // Only initialize socket if we're in admin context
    if (window.location.pathname.startsWith('/admin')) {
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    pendingLoanCount,
    socket,
    isConnected,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export { useNotifications };
