import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import { authenticate } from '@/lib/auth/middleware';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const postId = sanitizeId(id);

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const user = authenticate(req);

    if (user && validateObjectId(user.id)) {
      const alreadyLiked = post.likedBy.some((likedId) => likedId.toString() === user.id);
      if (alreadyLiked) {
        return NextResponse.json({ message: 'Already liked' });
      }
      post.likedBy.push(user.id as any);
      post.likes = post.likedBy.length;
    } else {
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();
    return NextResponse.json({ message: 'Liked!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
