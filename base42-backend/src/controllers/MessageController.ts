import { Request, Response } from 'express';
import { Message } from '../models';
import {
  getMessagesCached,
  getMessageByIdCached,
  getMessagesByUserCached,
  createMessageCached,
  updateMessageCached,
  deleteMessageCached
} from '../services/cachedDb';

// Request/Response type definitions
interface CreateMessageRequest {
  from: string;
  to: string;
  text: string;
}

interface UpdateMessageRequest {
  from?: string;
  to?: string;
  text?: string;
}

interface MessageParamsRequest extends Request {
  params: {
    id: string;
  };
}

interface MessageBodyRequest extends Request {
  body: CreateMessageRequest;
}

interface MessageUpdateRequest extends Request {
  params: {
    id: string;
  };
  body: UpdateMessageRequest;
}

interface UserMessagesRequest extends Request {
  params: {
    username: string;
  };
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class MessageController {
  /**
   * Get all messages
   * GET /messages
   */
  public async getMessages(req: Request, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const messages = await getMessagesCached();
      res.json({
        data: messages,
        message: `Retrieved ${messages.length} messages`
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get message by ID
   * GET /messages/:id
   */
  public async getMessageById(req: MessageParamsRequest, res: Response<ApiResponse<Message>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid message ID'
        });
        return;
      }
      
      const message = await getMessageByIdCached(id);
      
      if (!message) {
        res.status(404).json({
          error: 'Message not found'
        });
        return;
      }
      
      res.json({
        data: message
      });
    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create new message
   * POST /messages
   */
  public async createMessage(req: MessageBodyRequest, res: Response<ApiResponse<Message>>): Promise<void> {
    try {
      const { from, to, text } = req.body;
      
      // Validate required fields
      if (!from || !to || !text) {
        res.status(400).json({
          error: 'Missing required fields: from, to, text'
        });
        return;
      }
      
      // Validate that from and to are different
      if (from === to) {
        res.status(400).json({
          error: 'Cannot send message to yourself'
        });
        return;
      }
      
      // Validate text length
      if (text.trim().length === 0) {
        res.status(400).json({
          error: 'Message text cannot be empty'
        });
        return;
      }
      
      if (text.length > 1000) {
        res.status(400).json({
          error: 'Message text cannot exceed 1000 characters'
        });
        return;
      }
      
      const messageData: Omit<Message, 'id' | 'timestamp'> = {
        from: from.trim(),
        to: to.trim(),
        text: text.trim()
      };
      
      const message = await createMessageCached(messageData);
      
      res.status(201).json({
        data: message,
        message: 'Message created successfully'
      });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update message
   * PUT /messages/:id
   */
  public async updateMessage(req: MessageUpdateRequest, res: Response<ApiResponse<Message>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid message ID'
        });
        return;
      }
      
      // Validate that from and to are different if both are provided
      if (req.body.from && req.body.to && req.body.from === req.body.to) {
        res.status(400).json({
          error: 'Cannot send message to yourself'
        });
        return;
      }
      
      // Validate text length if provided
      if (req.body.text !== undefined) {
        if (req.body.text.trim().length === 0) {
          res.status(400).json({
            error: 'Message text cannot be empty'
          });
          return;
        }
        
        if (req.body.text.length > 1000) {
          res.status(400).json({
            error: 'Message text cannot exceed 1000 characters'
          });
          return;
        }
        
        req.body.text = req.body.text.trim();
      }
      
      // Trim from and to fields if provided
      if (req.body.from) {
        req.body.from = req.body.from.trim();
      }
      if (req.body.to) {
        req.body.to = req.body.to.trim();
      }
      
      const message = await updateMessageCached(id, req.body);
      
      if (!message) {
        res.status(404).json({
          error: 'Message not found'
        });
        return;
      }
      
      res.json({
        data: message,
        message: 'Message updated successfully'
      });
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete message
   * DELETE /messages/:id
   */
  public async deleteMessage(req: MessageParamsRequest, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid message ID'
        });
        return;
      }
      
      const deleted = await deleteMessageCached(id);
      
      if (!deleted) {
        res.status(404).json({
          error: 'Message not found'
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get messages by user
   * GET /messages/user/:username
   */
  public async getMessagesByUser(req: UserMessagesRequest, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const { username } = req.params;
      
      if (!username || username.trim().length === 0) {
        res.status(400).json({
          error: 'Username is required'
        });
        return;
      }
      
      const messages = await getMessagesByUserCached(username.trim());
      
      res.json({
        data: messages,
        message: `Retrieved ${messages.length} messages for user ${username}`
      });
    } catch (error) {
      console.error('Error fetching user messages:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get conversation between two users
   * GET /messages/conversation/:user1/:user2
   */
  public async getConversation(req: Request, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const { user1, user2 } = req.params;
      
      if (!user1 || !user2) {
        res.status(400).json({
          error: 'Both user1 and user2 are required'
        });
        return;
      }
      
      if (user1.trim() === user2.trim()) {
        res.status(400).json({
          error: 'Cannot get conversation with the same user'
        });
        return;
      }
      
      const user1Messages = await getMessagesByUserCached(user1.trim());
      
      // Filter messages to show only conversation between user1 and user2
      const conversation = user1Messages.filter(message => 
        (message.from === user1.trim() && message.to === user2.trim()) ||
        (message.from === user2.trim() && message.to === user1.trim())
      );
      
      // Sort by timestamp (oldest first)
      conversation.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      res.json({
        data: conversation,
        message: `Retrieved ${conversation.length} messages in conversation between ${user1} and ${user2}`
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get sent messages for a user
   * GET /messages/sent/:username
   */
  public async getSentMessages(req: UserMessagesRequest, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const { username } = req.params;
      
      if (!username || username.trim().length === 0) {
        res.status(400).json({
          error: 'Username is required'
        });
        return;
      }
      
      const userMessages = await getMessagesByUserCached(username.trim());
      const sentMessages = userMessages.filter(message => message.from === username.trim());
      
      res.json({
        data: sentMessages,
        message: `Retrieved ${sentMessages.length} sent messages for user ${username}`
      });
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get received messages for a user
   * GET /messages/received/:username
   */
  public async getReceivedMessages(req: UserMessagesRequest, res: Response<ApiResponse<Message[]>>): Promise<void> {
    try {
      const { username } = req.params;
      
      if (!username || username.trim().length === 0) {
        res.status(400).json({
          error: 'Username is required'
        });
        return;
      }
      
      const userMessages = await getMessagesByUserCached(username.trim());
      const receivedMessages = userMessages.filter(message => message.to === username.trim());
      
      res.json({
        data: receivedMessages,
        message: `Retrieved ${receivedMessages.length} received messages for user ${username}`
      });
    } catch (error) {
      console.error('Error fetching received messages:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}