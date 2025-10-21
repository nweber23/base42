import { Request, Response } from 'express';
import { Message } from '../models';
import {
  getConversationCached,
  getUserConversationsCached,
  createMessageCached,
  markMessagesAsReadCached
} from '../services/cachedDb';
import { emitNewMessage, emitMessagesRead } from '../services/socketService';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class MessageController {
  public async getConversation(req: Request, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const otherUserId = parseInt(req.params.userId);
      const currentUserId = parseInt(req.body.currentUserId || req.query.currentUserId as string);

      if (isNaN(otherUserId) || isNaN(currentUserId)) {
        res.status(400).json({ error: 'Invalid user IDs' });
        return;
      }

      const messages = await getConversationCached(currentUserId, otherUserId);
      res.json({ data: messages, message: `Retrieved ${messages.length} messages` });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getConversations(req: Request, res: Response<ApiResponse<any[]>>): Promise<void> {
    try {
      const currentUserId = parseInt(req.query.currentUserId as string);

      if (isNaN(currentUserId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const conversations = await getUserConversationsCached(currentUserId);
      res.json({ data: conversations, message: `Retrieved ${conversations.length} conversations` });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async sendMessage(req: Request, res: Response<ApiResponse<Message>>): Promise<void> {
    try {
      const receiverId = parseInt(req.params.userId);
      const { sender_id, content } = req.body;

      if (isNaN(receiverId) || !sender_id || !content) {
        res.status(400).json({ error: 'Missing required fields: sender_id, receiverId, content' });
        return;
      }

      if (sender_id === receiverId) {
        res.status(400).json({ error: 'Cannot send message to yourself' });
        return;
      }

      if (content.trim().length === 0) {
        res.status(400).json({ error: 'Message content cannot be empty' });
        return;
      }

      if (content.length > 5000) {
        res.status(400).json({ error: 'Message content cannot exceed 5000 characters' });
        return;
      }

      const messageData: Omit<Message, 'id' | 'created_at'> = {
        sender_id,
        receiver_id: receiverId,
        content: content.trim(),
        read: false
      };

      const message = await createMessageCached(messageData);
      emitNewMessage(message);

      res.status(201).json({ data: message, message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async markAsRead(req: Request, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const senderId = parseInt(req.params.userId);
      const { receiver_id } = req.body;

      if (isNaN(senderId) || !receiver_id) {
        res.status(400).json({ error: 'Invalid user IDs' });
        return;
      }

      const count = await markMessagesAsReadCached(senderId, receiver_id);
      emitMessagesRead(senderId, receiver_id);

      res.json({ data: { count }, message: `Marked ${count} messages as read` });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
