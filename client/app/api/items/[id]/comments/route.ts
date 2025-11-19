import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Item from '@/lib/db/models/Item';
import User from '@/lib/db/models/User';
import Comment from '@/lib/db/models/Comment';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';

function formatComment(comment: any) {
  return {
    id: comment._id.toString(),
    comment: comment.comment,
    username: comment.user?.username ?? 'Anonymous',
  };
}

// GET /api/items/[id]/comments - Get comments for an item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const itemId = sanitizeId(id);

    if (!validateObjectId(itemId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const comments = await Comment.find({ item: itemId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json(comments.map(formatComment));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/items/[id]/comments - Add a comment
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const itemId = sanitizeId(body.item_id);
    const userId = sanitizeId(body.user_id);
    const { comment } = body;

    if (
      !itemId ||
      !userId ||
      typeof comment !== 'string' ||
      !comment.trim()
    ) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    if (!validateObjectId(itemId) || !validateObjectId(userId)) {
      return NextResponse.json(
        { message: 'Invalid item or user ID.' },
        { status: 400 }
      );
    }

    const [item, user] = await Promise.all([
      Item.findById(itemId),
      User.findById(userId),
    ]);

    if (!item) {
      return NextResponse.json(
        { message: 'Item not found.' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const newComment = await Comment.create({
      item: itemId,
      user: userId,
      comment: comment.trim(),
    });

    await newComment.populate('user', 'username');

    return NextResponse.json(
      {
        message: 'Comment added successfully!',
        comment: formatComment(newComment),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
