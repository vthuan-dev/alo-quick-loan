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
  soundEnabled: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  clearNotifications: () => void;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    // Lấy setting từ localStorage, mặc định là true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSoundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Hàm toggle âm thanh thông báo
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(newValue));
  };

  // Hàm phát âm thanh thông báo cho loan mới
  const playNotificationSound = () => {
    if (!soundEnabled) return; // Không phát âm thanh nếu đã tắt
    
    console.log('🔊 Attempting to play notification sound...');
    
    // Thử đường dẫn chính
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.7;
    
    // Debug events
    audio.addEventListener('loadstart', () => console.log('📥 Loading started'));
    audio.addEventListener('canplay', () => console.log('✅ Can play'));
    audio.addEventListener('canplaythrough', () => console.log('✅ Can play through'));
    audio.addEventListener('error', (e) => {
      console.log('❌ Error loading sound:', e);
      console.log('🔄 Using fallback sound');
      playFallbackSound();
    });
    
    // Thử phát âm thanh
    audio.play().then(() => {
      console.log('🎉 Successfully played notification sound');
    }).catch((error) => {
      console.log('❌ Failed to play sound:', error);
      console.log('🔄 Using fallback sound');
      playFallbackSound();
    });
  };

  // Fallback: tạo âm thanh bằng Web Audio API nếu file không có
  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.15);
      }, 200);
      
    } catch (error) {
      console.log('Fallback sound also failed:', error);
    }
  };

  // Hàm phát âm thanh thông báo cho status update (âm thanh khác)
  const playStatusUpdateSound = () => {
    if (!soundEnabled) return; // Không phát âm thanh nếu đã tắt
    
    try {
      // Sử dụng file âm thanh tùy chỉnh cho status update (có thể dùng file khác)
      const audio = new Audio('/sounds/notification.mp3'); // Có thể thay bằng file khác
      audio.volume = 0.5; // Volume thấp hơn cho status update
      audio.play().catch((error) => {
        console.log('Could not play status update sound file:', error);
        // Fallback: tạo âm thanh ngắn bằng Web Audio API
        playStatusUpdateFallbackSound();
      });
    } catch (error) {
      console.log('Error loading status update sound:', error);
      playStatusUpdateFallbackSound();
    }
  };

  // Fallback cho status update sound
  const playStatusUpdateFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.log('Status update fallback sound also failed:', error);
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Calculate pending loan count (new loan applications)
  const pendingLoanCount = notifications.filter(n => 
    n.type === 'NEW_LOAN_APPLICATION' && !n.isRead
  ).length;

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
      const newSocket = io(`${wsUrl}/admin`, {
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
        
        // Phát âm thanh thông báo
        playNotificationSound();
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
        
        // Phát âm thanh thông báo status update
        playStatusUpdateSound();
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
    soundEnabled,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
    toggleSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
