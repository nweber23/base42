import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { setCache, getCache, deleteCache } from './cache';

let io: SocketIOServer | null = null;

// Map to track user ID to socket ID
const userSocketMap = new Map<number, string>();

// Cache key for online users
const ONLINE_USERS_KEY = 'users:online';

/**
 * Initialize Socket.IO server
 */
export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user authentication/registration
    socket.on('auth', async (data: { userId: number; userName: string }) => {
      const { userId, userName } = data;

      if (!userId) {
        console.error('Socket auth failed: missing userId');
        return;
      }

      // Store user-socket mapping
      userSocketMap.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.userName = userName;

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Update online users in Redis
      await updateOnlineUsers();

      console.log(`User ${userId} (${userName}) authenticated with socket ${socket.id}`);

      // Notify user of successful auth
      socket.emit('authenticated', { userId, socketId: socket.id });

      // Broadcast updated online users list
      io?.emit('online_users_updated', await getOnlineUsers());
    });

    // Handle joining a conversation room
    socket.on('join_conversation', (data: { otherUserId: number }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      const conversationRoom = getConversationRoom(userId, data.otherUserId);
      socket.join(conversationRoom);
      console.log(`User ${userId} joined conversation ${conversationRoom}`);
    });

    // Handle leaving a conversation room
    socket.on('leave_conversation', (data: { otherUserId: number }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      const conversationRoom = getConversationRoom(userId, data.otherUserId);
      socket.leave(conversationRoom);
      console.log(`User ${userId} left conversation ${conversationRoom}`);
    });

    // Handle typing indicator
    socket.on('typing', (data: { receiverId: number; isTyping: boolean }) => {
      const userId = socket.data.userId;
      if (!userId) return;

      // Send typing status to the receiver
      io?.to(`user:${data.receiverId}`).emit('user_typing', {
        userId,
        isTyping: data.isTyping
      });
    });

    // Handle mark messages as read
    socket.on('mark_read', async (data: { senderId: number; receiverId: number }) => {
      // This is handled in the MessageController, but we can emit confirmation
      io?.to(`user:${data.senderId}`).emit('messages_read', {
        receiverId: data.receiverId
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      console.log(`Socket disconnected: ${socket.id}${userId ? ` (User ${userId})` : ''}`);

      if (userId) {
        userSocketMap.delete(userId);
        await updateOnlineUsers();

        // Broadcast updated online users list
        io?.emit('online_users_updated', await getOnlineUsers());
      }
    });
  });

  return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Get conversation room name (consistent regardless of user order)
 */
export const getConversationRoom = (userId1: number, userId2: number): string => {
  const [id1, id2] = [userId1, userId2].sort();
  return `conversation:${id1}:${id2}`;
};

/**
 * Emit a new message to conversation participants
 */
export const emitNewMessage = (message: any) => {
  if (!io) return;

  const conversationRoom = getConversationRoom(message.sender_id, message.receiver_id);

  // Emit to conversation room
  io.to(conversationRoom).emit('new_message', message);

  // Also emit to both users' personal rooms (in case they're not in conversation room)
  io.to(`user:${message.sender_id}`).emit('new_message', message);
  io.to(`user:${message.receiver_id}`).emit('new_message', message);

  console.log(`Emitted new message to conversation ${conversationRoom}`);
};

/**
 * Emit message read status update
 */
export const emitMessagesRead = (senderId: number, receiverId: number) => {
  if (!io) return;

  io.to(`user:${senderId}`).emit('messages_read', { receiverId });
  console.log(`Emitted messages_read to user ${senderId} for messages from ${receiverId}`);
};

/**
 * Update online users in Redis cache
 */
const updateOnlineUsers = async () => {
  const onlineUserIds = Array.from(userSocketMap.keys());
  await setCache(ONLINE_USERS_KEY, onlineUserIds, 300); // 5 minutes TTL
};

/**
 * Get list of currently online user IDs
 */
export const getOnlineUsers = async (): Promise<number[]> => {
  const cached = await getCache<number[]>(ONLINE_USERS_KEY);
  return cached || [];
};

/**
 * Check if a specific user is online
 */
export const isUserOnline = async (userId: number): Promise<boolean> => {
  const onlineUsers = await getOnlineUsers();
  return onlineUsers.includes(userId);
};

/**
 * Get socket ID for a specific user
 */
export const getUserSocketId = (userId: number): string | undefined => {
  return userSocketMap.get(userId);
};

export default {
  initializeSocketIO,
  getIO,
  emitNewMessage,
  emitMessagesRead,
  getOnlineUsers,
  isUserOnline,
  getUserSocketId,
  getConversationRoom
};
