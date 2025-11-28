import pool from '../postgres';

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
}

export interface CommentWithUser extends Comment {
  username: string;
}

export const CommentModel = {
  async create(postId: number | string, userId: number | string, comment: string): Promise<Comment> {
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, comment) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [postId, userId, comment]
    );
    return result.rows[0];
  },

  async findByPostId(postId: number | string): Promise<CommentWithUser[]> {
    const result = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );
    return result.rows;
  },

  async countByPostId(postId: number | string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = $1',
      [postId]
    );
    return parseInt(result.rows[0].count);
  },

  async delete(id: number | string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1',
      [id]
    );
    return result.rowCount! > 0;
  }
};

export default CommentModel;
