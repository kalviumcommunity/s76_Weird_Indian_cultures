import pool from '../postgres';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  bio: string;
  profile_pic: string | null;
  created_at: Date;
  updated_at: Date;
}

export const UserModel = {
  async create(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [username, email, hashedPassword]
    );
    return result.rows[0];
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id: number | string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, username, email, bio, profile_pic, created_at FROM users ORDER BY username'
    );
    return result.rows;
  },

  async update(id: number | string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'password') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async matchPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  },

  async getFollowing(userId: number | string): Promise<number[]> {
    const result = await pool.query(
      'SELECT following_id FROM follows WHERE follower_id = $1',
      [userId]
    );
    return result.rows.map(row => row.following_id);
  },

  async getFollowers(userId: number | string): Promise<number[]> {
    const result = await pool.query(
      'SELECT follower_id FROM follows WHERE following_id = $1',
      [userId]
    );
    return result.rows.map(row => row.follower_id);
  },

  async follow(followerId: number | string, followingId: number | string): Promise<void> {
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, followingId]
    );
  },

  async unfollow(followerId: number | string, followingId: number | string): Promise<void> {
    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
  },

  async isFollowing(followerId: number | string, followingId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    return result.rows.length > 0;
  },

  async getFollowingWithDetails(userId: number | string): Promise<any[]> {
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_pic 
       FROM follows f 
       JOIN users u ON f.following_id = u.id 
       WHERE f.follower_id = $1 
       ORDER BY u.username ASC`,
      [userId]
    );
    return result.rows.map(row => ({
      id: row.id.toString(),
      username: row.username,
      profilePic: row.profile_pic || null,
    }));
  }
};

export default UserModel;
