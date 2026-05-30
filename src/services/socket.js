import io from 'socket.io-client';

// Determine backend URL
const getBackendUrl = () => {
  // For Railway deployment
  if (window.location.hostname.includes('railway.app')) {
    return `https://${window.location.hostname}`;
  }
  // For development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  // For local network
  return `http://${window.location.hostname}:3001`;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  connect(backendUrl = null) {
    return new Promise((resolve, reject) => {
      try {
        const url = backendUrl || getBackendUrl();
        console.log(`[SocketService] Connecting to ${url}`);

        this.socket = io(url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          autoConnect: true
        });

        // Connection successful
        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('[SocketService] Connected:', this.socket.id);
          this.emit('connected');
          resolve(this.socket.id);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('[SocketService] Connection error:', error);
          this.emit('connection_error', error);
          reject(error);
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', () => {
          console.log('[SocketService] Attempting to reconnect...');
          this.emit('reconnecting');
        });

        // Reconnection success
        this.socket.on('reconnect', () => {
          this.isConnected = true;
          console.log('[SocketService] Reconnected');
          this.emit('reconnected');
        });

        // Disconnection
        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('[SocketService] Disconnected');
          this.emit('disconnected');
        });
      } catch (error) {
        console.error('[SocketService] Connection failed:', error);
        reject(error);
      }
    });
  }

  joinRoom(roomCode, userName) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('join_room', { roomCode, userName }, (response) => {
        if (response.success) {
          console.log('[SocketService] Joined room:', roomCode);
          resolve(response);
        } else {
          console.error('[SocketService] Failed to join room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  sendMessage(roomCode, message, timestamp) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('send_message', { roomCode, message, timestamp }, (response) => {
        if (response.success) {
          console.log('[SocketService] Message sent:', response.messageId);
          resolve(response);
        } else {
          console.error('[SocketService] Failed to send message:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  getRoomUsers(roomCode) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('get_room_users', { roomCode }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  ping() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('ping', (response) => {
        resolve(response);
      });
    });
  }

  // Event listeners
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Also attach to socket if it's a server event
    if (this.socket) {
      this.socket.off(event); // Remove old listeners
      this.socket.on(event, (data) => {
        this.listeners[event].forEach(cb => cb(data));
      });
    }
  }

  off(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
    }
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // Message receiving
  onReceiveMessage(callback) {
    this.on('receive_message', callback);
  }

  // User joined
  onUserJoined(callback) {
    this.on('user_joined', callback);
  }

  // User left
  onUserLeft(callback) {
    this.on('user_left', callback);
  }

  // Connection status
  onConnectionChange(callback) {
    this.on('connected', () => callback(true));
    this.on('disconnected', () => callback(false));
    this.on('reconnected', () => callback(true));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('[SocketService] Disconnected');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Export singleton instance
export default new SocketService();
