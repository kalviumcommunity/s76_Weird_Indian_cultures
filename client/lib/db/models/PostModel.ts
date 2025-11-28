import pool from '../postgres';

export interface Post {
  id: number;
  caption: string;
  location: string;
  tags: string;
  created_by: number;
  image_url: string | null;
  video_url: string | null;
  likes: number;
  saves: number;
  created_at: Date;
  updated_at: Date;
}

export const PostModel = {
  async create(data: {
    caption: string;
    location?: string;
    tags?: string;
    created_by: number;
    image_url?: string | null;
    video_url?: string | null;
  }): Promise<Post> {
    const result = await pool.query(
      `INSERT INTO posts (caption, location, tags, created_by, image_url, video_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.caption,
        data.location || '',
        data.tags || '',
        data.created_by,
        data.image_url || null,
        data.video_url || null
      ]
    );
    return result.rows[0];
  },

  async findById(id: number | string): Promise<Post | null> {
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(options?: { limit?: number; offset?: number }): Promise<Post[]> {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  async findByUserId(userId: number | string): Promise<Post[]> {
    const result = await pool.query(
      'SELECT * FROM posts WHERE created_by = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findByFollowing(userId: number | string): Promise<Post[]> {
    const result = await pool.query(
      `SELECT p.* FROM posts p
       INNER JOIN follows f ON p.created_by = f.following_id
       WHERE f.follower_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async findSavedByUser(userId: number | string): Promise<Post[]> {
    const result = await pool.query(
      `SELECT p.* FROM posts p
       INNER JOIN post_saves ps ON p.id = ps.post_id
       WHERE ps.user_id = $1
       ORDER BY ps.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async update(id: number | string, data: Partial<Post>): Promise<Post | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_by') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: number | string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1',
      [id]
    );
    return result.rowCount! > 0;
  },

  async like(postId: number | string, userId: number | string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add like
      await client.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, userId]
      );
      
      // Update count
      await client.query(
        'UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1) WHERE id = $1',
        [postId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async unlike(postId: number | string, userId: number | string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove like
      await client.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      
      // Update count
      await client.query(
        'UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1) WHERE id = $1',
        [postId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async isLikedBy(postId: number | string, userId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rows.length > 0;
  },

  async save(postId: number | string, userId: number | string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add save
      await client.query(
        'INSERT INTO post_saves (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, userId]
      );
      
      // Update count
      await client.query(
        'UPDATE posts SET saves = (SELECT COUNT(*) FROM post_saves WHERE post_id = $1) WHERE id = $1',
        [postId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async unsave(postId: number | string, userId: number | string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove save
      await client.query(
        'DELETE FROM post_saves WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      
      // Update count
      await client.query(
        'UPDATE posts SET saves = (SELECT COUNT(*) FROM post_saves WHERE post_id = $1) WHERE id = $1',
        [postId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async isSavedBy(postId: number | string, userId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM post_saves WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rows.length > 0;
  },

  async hasLiked(userId: number | string, postId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    return result.rows.length > 0;
  },

  async hasSaved(userId: number | string, postId: number | string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM post_saves WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    return result.rows.length > 0;
  }
};

export default PostModel;
