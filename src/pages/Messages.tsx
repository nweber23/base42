import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import type { User, Message, MessageThread } from '../types';
import messagesData from '../data/messages.json';

interface MessageBubbleProps {
  message: Message;
  sender: User;
  isCurrentUser: boolean;
}

interface ThreadListItemProps {
  thread: MessageThread;
  users: User[];
  currentUserId: number;
  isActive: boolean;
  onClick: () => void;
}

interface ChatViewProps {
  thread: MessageThread;
  users: User[];
  currentUserId: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, isCurrentUser }) => {
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          isCurrentUser ? 'bg-blue-500' : 'bg-gray-500'
        }`}>
          {sender.name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="flex items-center mt-1 space-x-1">
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          {!message.isRead && !isCurrentUser && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread, users, currentUserId, isActive, onClick }) => {
  const getThreadDisplayInfo = () => {
    if (thread.isGroup) {
      return {
        name: thread.groupName || 'Group Chat',
        avatar: '👥'
      };
    } else {
      const otherParticipant = users.find(u => 
        thread.participants.includes(u.id) && u.id !== currentUserId
      );
      return {
        name: otherParticipant?.name || 'Unknown User',
        avatar: otherParticipant?.name.split(' ').map(n => n[0]).join('') || '?'
      };
    }
  };

  const getLastMessage = (): Message | undefined => {
    return thread.messages[thread.messages.length - 1];
  };

  const getUnreadCount = (): number => {
    return thread.messages.filter(msg => 
      !msg.isRead && msg.senderId !== currentUserId
    ).length;
  };

  const formatLastActivity = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const { name, avatar } = getThreadDisplayInfo();
  const lastMessage = getLastMessage();
  const unreadCount = getUnreadCount();

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors border-b border-gray-200 hover:bg-gray-50 ${
        isActive ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {thread.isGroup ? (
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg">
              {avatar}
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {avatar}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatLastActivity(thread.lastActivity)}
              </span>
              {unreadCount > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate">
              {lastMessage.senderId === currentUserId ? 'You: ' : ''}
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatView: React.FC<ChatViewProps> = ({ thread, users, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages]);

  const getThreadDisplayInfo = () => {
    if (thread.isGroup) {
      const participantNames = thread.participants
        .map(id => users.find(u => u.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      
      return {
        name: thread.groupName || 'Group Chat',
        subtitle: `${thread.participants.length} members: ${participantNames}`,
        avatar: '👥'
      };
    } else {
      const otherParticipant = users.find(u => 
        thread.participants.includes(u.id) && u.id !== currentUserId
      );
      return {
        name: otherParticipant?.name || 'Unknown User',
        subtitle: `${otherParticipant?.campus} • Level ${otherParticipant?.level}`,
        avatar: otherParticipant?.name.split(' ').map(n => n[0]).join('') || '?'
      };
    }
  };

  const { name, subtitle, avatar } = getThreadDisplayInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {thread.isGroup ? (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
              {avatar}
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {avatar}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {thread.messages.map((message) => {
          const sender = users.find(u => u.id === message.senderId);
          if (!sender) return null;
          
          return (
            <MessageBubble
              key={message.id}
              message={message}
              sender={sender}
              isCurrentUser={message.senderId === currentUserId}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // In a real app, this would send the message
                console.log('Message would be sent:', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button 
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Messages: React.FC = () => {
  const { currentUser, users } = useUser();
  const { theme } = useTheme();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const threads = useMemo(() => {
    const messageThreads: MessageThread[] = messagesData as MessageThread[];
    return messageThreads
      .filter(thread => thread.participants.includes(currentUser.id))
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [currentUser.id]);

  const selectedThread = useMemo(() => {
    return threads.find(thread => thread.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Auto-select first thread if none selected
  useEffect(() => {
    if (threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((total, thread) => {
      const unreadInThread = thread.messages.filter(msg => 
        !msg.isRead && msg.senderId !== currentUser.id
      ).length;
      return total + unreadInThread;
    }, 0);
  }, [threads, currentUser.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className={`text-3xl font-bold ${theme.text.primary} transition-colors duration-300`}>Messages</h1>
        <p className={`${theme.text.secondary} mt-2 transition-colors duration-300`}>
          Stay connected with your peers at 42 Heilbronn
          {totalUnreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 transition-colors duration-300">
              {totalUnreadCount} unread
            </span>
          )}
        </p>
      </div>

      <div className={`${theme.bg.card} rounded-lg shadow-xl border ${theme.border.primary} overflow-hidden transition-colors duration-300 animate-slide-up`} style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Thread List */}
          <div className={`w-1/3 border-r ${theme.border.primary} flex flex-col transition-colors duration-300`}>
            <div className={`p-4 border-b ${theme.border.primary} ${theme.bg.tertiary} transition-colors duration-300`}>
              <h2 className={`text-lg font-semibold ${theme.text.primary} transition-colors duration-300`}>Conversations</h2>
              {totalUnreadCount > 0 && (
                <p className={`text-sm ${theme.text.secondary} mt-1 transition-colors duration-300`}>
                  {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <p>No conversations yet.</p>
                  <p className="text-sm mt-2">Start chatting with your peers!</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <ThreadListItem
                    key={thread.id}
                    thread={thread}
                    users={users}
                    currentUserId={currentUser.id}
                    isActive={thread.id === selectedThreadId}
                    onClick={() => setSelectedThreadId(thread.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <ChatView
                thread={selectedThread}
                users={users}
                currentUserId={currentUser.id}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;