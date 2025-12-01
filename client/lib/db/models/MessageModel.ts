import pool from '../postgres';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  is_request: boolean;
  request_accepted: boolean;
  created_at: Date;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at: Date;
  created_at: Date;
}

export const MessageModel = {
  // Check if user is blocked
  async isBlocked(userId: number | string, otherUserId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [otherUserId, userId]
    );
    return result.rows.length > 0;
  },

  // Check if sender follows receiver
  async doesSenderFollowReceiver(senderId: number | string, receiverId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [senderId, receiverId]
    );
    return result.rows.length > 0;
  },

  // Check if both users follow each other
  async areMutualFollowers(user1Id: number | string, user2Id: number | string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM follows f1
       INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
       WHERE f1.follower_id = $1 AND f1.following_id = $2`,
      [user1Id, user2Id]
    );
    return result.rows.length > 0;
  },

  // Get or create conversation between two users
  async getOrCreateConversation(user1Id: number | string, user2Id: number | string): Promise<Conversation> {
    // Prevent users from messaging themselves
    if (user1Id.toString() === user2Id.toString()) {
      throw new Error('Cannot create conversation with yourself');
    }

    const sortedIds = [parseInt(user1Id.toString()), parseInt(user2Id.toString())].sort((a, b) => a - b);
    
    // Try to get existing conversation
    let result = await pool.query(
      'SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2',
      sortedIds
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create new conversation
    result = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      sortedIds
    );
    return result.rows[0];
  },

  // Send a message - Instagram Style
  // Rule: If A follows B, A can message B (goes to B's requests unless mutual or already accepted)
  async sendMessage(data: {
    senderId: number | string;
    receiverId: number | string;
    content: string;
  }): Promise<Message | null> {
    const { senderId, receiverId, content } = data;

    console.log('MessageModel.sendMessage:', { senderId, receiverId, content });

    // Check if sender is blocked by receiver
    const isBlocked = await this.isBlocked(senderId, receiverId);
    console.log('Is blocked:', isBlocked);
    if (isBlocked) {
      return null;
    }

    // Check if sender follows receiver (Instagram rule: must follow to message)
    const senderFollowsReceiver = await this.doesSenderFollowReceiver(senderId, receiverId);
    console.log('Sender follows receiver:', senderFollowsReceiver);
    
    // Check if they are mutual followers
    const areMutual = await this.areMutualFollowers(senderId, receiverId);
    console.log('Are mutual followers:', areMutual);

    // Get or create conversation
    console.log('Getting or creating conversation...');
    const conversation = await this.getOrCreateConversation(senderId, receiverId);
    console.log('Conversation:', conversation);

    // Check if there's already an accepted conversation
    const hasAcceptedConversation = await pool.query(
      `SELECT 1 FROM messages 
       WHERE conversation_id = $1 
       AND request_accepted = TRUE
       LIMIT 1`,
      [conversation.id]
    );

    // Instagram Logic:
    // 1. If mutual followers → Direct message (no request)
    // 2. If already accepted conversation → Direct message
    // 3. If sender follows receiver (not mutual) → Goes to requests
    // 4. If sender doesn't follow receiver → Can still message (goes to requests)
    const isDirectMessage = areMutual || hasAcceptedConversation.rows.length > 0;
    const isRequest = !isDirectMessage;

    console.log('Message type - isRequest:', isRequest, 'isDirectMessage:', isDirectMessage);

    // Insert message
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, content, is_request, request_accepted)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [conversation.id, senderId, receiverId, content, isRequest, isDirectMessage]
    );

    console.log('Message inserted:', result.rows[0]);

    // Update conversation last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversation.id]
    );

    return result.rows[0];
  },

  // Accept message request
  async acceptRequest(conversationId: number | string, userId: number | string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE messages 
       SET request_accepted = TRUE 
       WHERE conversation_id = $1 
       AND receiver_id = $2 
       AND is_request = TRUE
       RETURNING *`,
      [conversationId, userId]
    );
    return result.rows.length > 0;
  },

  // Decline/Delete message request
  async declineRequest(conversationId: number | string, userId: number | string): Promise<boolean> {
    // Delete all messages in the request conversation
    const result = await pool.query(
      `DELETE FROM messages 
       WHERE conversation_id = $1 
       AND receiver_id = $2 
       AND is_request = TRUE 
       AND request_accepted = FALSE`,
      [conversationId, userId]
    );
    return result.rowCount! > 0;
  },

  // Get all conversations for a user
  async getConversations(userId: number | string): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = $1 THEN c.user2_id 
          ELSE c.user1_id 
        END as other_user_id,
        CASE 
          WHEN c.user1_id = $1 THEN u2.username 
          ELSE u1.username 
        END as other_username,
        CASE 
          WHEN c.user1_id = $1 THEN u2.profile_pic 
          ELSE u1.profile_pic 
        END as other_profile_pic,
        m.content as last_message,
        m.sender_id as last_message_sender_id,
        m.created_at as last_message_time,
        m.is_read,
        m.is_request,
        m.request_accepted
      FROM conversations c
      INNER JOIN users u1 ON c.user1_id = u1.id
      INNER JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT * FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
      AND m.id IS NOT NULL
      AND (
        (m.is_request = FALSE) OR 
        (m.is_request = TRUE AND m.request_accepted = TRUE) OR
        (m.is_request = TRUE AND m.receiver_id = $1)
      )
      ORDER BY c.last_message_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get message requests for a user
  async getMessageRequests(userId: number | string): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        c.*,
        u.id as sender_id,
        u.username as sender_username,
        u.profile_pic as sender_profile_pic,
        m.content as last_message,
        m.created_at as last_message_time
      FROM conversations c
      INNER JOIN messages m ON c.id = m.conversation_id
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = $1
      AND m.is_request = TRUE
      AND m.request_accepted = FALSE
      AND m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
      ORDER BY m.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get messages in a conversation
  async getMessages(conversationId: number | string, userId: number | string): Promise<Message[]> {
    // First check if user is part of the conversation
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return [];
    }

    const result = await pool.query(
      `SELECT m.*, u.username as sender_username, u.profile_pic as sender_profile_pic
       FROM messages m
       INNER JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       AND (
         (m.is_request = FALSE) OR
         (m.is_request = TRUE AND m.request_accepted = TRUE) OR
         (m.is_request = TRUE AND m.receiver_id = $2)
       )
       ORDER BY m.created_at ASC`,
      [conversationId, userId]
    );

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = FALSE',
      [conversationId, userId]
    );

    return result.rows;
  },

  // Block user
  async blockUser(blockerId: number | string, blockedId: number | string): Promise<void> {
    await pool.query(
      'INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [blockerId, blockedId]
    );
  },

  // Unblock user
  async unblockUser(blockerId: number | string, blockedId: number | string): Promise<void> {
    await pool.query(
      'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );
  },

  // Get unread message count
  async getUnreadCount(userId: number | string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 
       AND is_read = FALSE
       AND (
         (is_request = FALSE) OR 
         (is_request = TRUE AND request_accepted = TRUE)
       )`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get message request count
  async getRequestCount(userId: number | string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT conversation_id) as count 
       FROM messages 
       WHERE receiver_id = $1 
       AND is_request = TRUE 
       AND request_accepted = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
};

export default MessageModel;
