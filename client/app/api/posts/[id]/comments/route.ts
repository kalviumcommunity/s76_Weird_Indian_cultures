import { NextRequest, NextResponse } from 'next/server';
import CommentModel from '@/lib/db/models/CommentModel';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await CommentModel.findByPostId(id);
    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { comment } = await req.json();

    if (!comment || !comment.trim()) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    const newComment = await CommentModel.create(id, authUser.id, comment.trim());

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
