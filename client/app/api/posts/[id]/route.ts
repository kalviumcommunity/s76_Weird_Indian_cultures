import { NextRequest, NextResponse } from 'next/server';
import PostModel from '@/lib/db/models/PostModel';
import { authenticate } from '@/lib/auth/middleware';
import pool from '@/lib/db/postgres';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    const { id } = await params;
    
    const post = await PostModel.findById(id, authUser?.id);
    
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Get post error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if post exists and belongs to user
    const result = await pool.query(
      'SELECT created_by FROM posts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (result.rows[0].created_by !== authUser.id) {
      return NextResponse.json({ message: 'Unauthorized to delete this post' }, { status: 403 });
    }

    // Delete post (cascade will handle related data)
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { caption, location, tags } = await req.json();

    // Check if post exists and belongs to user
    const checkResult = await pool.query(
      'SELECT created_by FROM posts WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (checkResult.rows[0].created_by !== authUser.id) {
      return NextResponse.json({ message: 'Unauthorized to edit this post' }, { status: 403 });
    }

    // Update post
    const result = await pool.query(
      `UPDATE posts 
       SET caption = $1, location = $2, tags = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [caption || '', location || '', tags || [], id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update post error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
