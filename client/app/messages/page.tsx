'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Conversation {
  conversationId: number;
  otherUser: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface MessageRequest {
  conversationId: number;
  sender: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface FollowedUser {
  id: string;
  username: string;
  profilePic: string | null;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
  sender_profile_pic: string | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [showFollowedList, setShowFollowedList] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Selected conversation state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    fetchFollowedUsers();
    
    // Real-time polling - every 2 seconds for faster updates
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.conversationId);
      }
    }, 2000); // Much faster polling for real-time feel

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversationId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);

    // Optimistic update - add message to UI immediately
    const tempMessage: Message = {
      id: Date.now(), // temporary ID
      sender_id: -1, // will be replaced
      receiver_id: parseInt(selectedConversation.otherUser.id),
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_username: 'You',
      sender_profile_pic: null
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          content: messageContent
        }),
      });

      if (response.ok) {
        // Immediately fetch updated messages for accurate data
        await fetchMessages(selectedConversation.conversationId);
        await fetchConversations();
      } else {
        // Rollback optimistic update on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        const error = await response.json();
        alert(error.message || 'Failed to send message');
      }
    } catch (error) {
      // Rollback optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = (userId: string, username: string) => {
    // Create a temporary conversation for new chat
    const tempConv: Conversation = {
      conversationId: 0, // temporary
      otherUser: {
        id: userId,
        username: username,
        profilePic: null
      },
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0
    };
    setSelectedConversation(tempConv);
    setMessages([]);
    setShowFollowedList(false);
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/messages/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchFollowedUsers = async () => {
    try {
      console.log('Fetching followed users...');
      const response = await fetch('/api/users/following');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Followed users data:', data);
        setFollowedUsers(data);
      } else {
        console.error('Failed to fetch followed users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  };

  const handleTabChange = (tab: 'chats' | 'requests') => {
    setActiveTab(tab);
    if (tab === 'requests' && requests.length === 0) {
      fetchRequests();
    }
  };

  const handleAcceptRequest = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        // Refresh both lists
        fetchRequests();
        fetchConversations();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'now';
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Left Sidebar - Chat List */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <button
            onClick={() => setShowFollowedList(!showFollowedList)}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700"
            title="Show people you follow"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

        {/* Followed Users Section - Always visible when has followers */}
        {followedUsers.length > 0 && !showFollowedList && (
          <div className="border-b border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-xs text-gray-500">PEOPLE YOU FOLLOW</h3>
              <button
                onClick={() => setShowFollowedList(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                See all ({followedUsers.length})
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {followedUsers.slice(0, 6).map((user) => (
                <button
                  key={user.id}
                  onClick={() => router.push(`/messages/new?userId=${user.id}&username=${user.username}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 hover:opacity-80 transition"
                >
                  {user.profilePic ? (
                    <Image
                      src={user.profilePic}
                      alt={user.username}
                      width={56}
                      height={56}
                      className="rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-semibold border-2 border-gray-300 text-white">
                      {getInitials(user.username)}
                    </div>
                  )}
                  <span className="text-xs max-w-[60px] truncate">{user.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Followed Users Dropdown */}
        {showFollowedList && (
          <div className="border-b border-gray-200 bg-white max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">People you follow ({followedUsers.length})</h3>
                <button
                  onClick={() => setShowFollowedList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {followedUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <p>You don&apos;t follow anyone yet</p>
                <p className="text-xs mt-1 text-gray-400">Go to Explore to find people to follow</p>
              </div>
            ) : (
              followedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartNewChat(user.id, user.username)}
                  className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 transition text-gray-900"
                >
                  {user.profilePic ? (
                    <Image
                      src={user.profilePic}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-semibold text-white">
                      {getInitials(user.username)}
                    </div>
                  )}
                  <span className="font-medium">{user.username}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => handleTabChange('chats')}
            className={`flex-1 py-3 font-semibold transition ${
              activeTab === 'chats'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => handleTabChange('requests')}
            className={`flex-1 py-3 font-semibold transition ${
              activeTab === 'requests'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requests
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-2 text-gray-400">Start a conversation by visiting someone&apos;s profile</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-200 transition ${
                    selectedConversation?.conversationId === conv.conversationId ? 'bg-gray-100' : ''
                  }`}
                >
                  {conv.otherUser.profilePic ? (
                    <Image
                      src={conv.otherUser.profilePic}
                      alt={conv.otherUser.username}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-semibold">
                      {getInitials(conv.otherUser.username)}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{conv.otherUser.username}</span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  )}
                </button>
              ))
            )
          ) : (
            requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No message requests</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.conversationId}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {req.sender.profilePic ? (
                      <Image
                        src={req.sender.profilePic}
                        alt={req.sender.username}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-semibold">
                        {getInitials(req.sender.username)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{req.sender.username}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(req.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {req.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.conversationId)}
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.conversationId)}
                      className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Right Side - Conversation View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.otherUser.profilePic ? (
                  <Image
                    src={selectedConversation.otherUser.profilePic}
                    alt={selectedConversation.otherUser.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-semibold text-white">
                    {getInitials(selectedConversation.otherUser.username)}
                  </div>
                )}
                <button
                  onClick={() => router.push(`/profile/${selectedConversation.otherUser.id}`)}
                  className="font-semibold text-gray-900 hover:text-gray-600"
                >
                  {selectedConversation.otherUser.username}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-300 mb-4"></div>
                  <p className="text-gray-600 font-medium">Start a conversation</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Send a message to {selectedConversation.otherUser.username}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isOwn = msg.sender_id.toString() === selectedConversation.otherUser.id ? false : true;
                    const isTempMessage = msg.id > 1000000000000; // Check if it's a temporary message
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-[slideIn_0.2s_ease-out]`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 transition-all ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          } ${isTempMessage ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          {isTempMessage && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={`Message ${selectedConversation.otherUser.username}...`}
                  disabled={sending}
                  autoFocus
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 disabled:bg-gray-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`p-2 rounded-full transition-all ${
                    newMessage.trim() && !sending
                      ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      : 'text-gray-300'
                  }`}
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          // Empty state when no conversation selected
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 rounded-full border-4 border-gray-900 mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Your messages</h2>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Send private photos and messages to a friend or group
            </p>
            <button
              onClick={() => setShowFollowedList(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Send message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
