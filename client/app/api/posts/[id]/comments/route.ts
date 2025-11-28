import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import User from '@/lib/db/models/User';
import Comment from '@/lib/db/models/Comment';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';
import mongoose from 'mongoose';

function formatComment(comment: any) {
  return {
    id: comment._id.toString(),
    comment: comment.comment,
    username: comment.user?.username ?? 'Anonymous',
    createdAt: comment.createdAt,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const postId = sanitizeId(id);

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const comments = await Comment.find({ item: postId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const commentCount = await Comment.countDocuments({ item: postId });

    return NextResponse.json({
      comments: comments.map(formatComment),
      count: commentCount
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const postId = sanitizeId(body.item_id);
    const userId = sanitizeId(body.user_id);
    const { comment } = body;

    if (!postId || !userId || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    if (!validateObjectId(postId) || !validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid post or user ID.' }, { status: 400 });
    }

    const [post, user] = await Promise.all([Post.findById(postId), User.findById(userId)]);

    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const newComment = await Comment.create({
      item: new mongoose.Types.ObjectId(postId),
      user: new mongoose.Types.ObjectId(userId),
      comment: comment.trim(),
    });

    await newComment.populate('user', 'username');

    const commentCount = await Comment.countDocuments({ item: postId });

    return NextResponse.json(
      { 
        message: 'Comment added successfully!', 
        comment: formatComment(newComment),
        count: commentCount
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add comment error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
