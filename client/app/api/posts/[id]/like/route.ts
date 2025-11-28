import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import { authenticate } from '@/lib/auth/middleware';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';
import mongoose from 'mongoose';

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

    if (!user || !validateObjectId(user.id)) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(user.id);
    const likedIndex = post.likedBy.findIndex((likedId) => likedId.toString() === user.id);
    
    if (likedIndex > -1) {
      // Unlike: remove user from likedBy array
      post.likedBy.splice(likedIndex, 1);
      post.likes = post.likedBy.length;
      await post.save();
      return NextResponse.json({ 
        message: 'Unliked', 
        liked: false, 
        likes: post.likes 
      });
    } else {
      // Like: add user to likedBy array
      post.likedBy.push(userObjectId);
      post.likes = post.likedBy.length;
      await post.save();
      return NextResponse.json({ 
        message: 'Liked', 
        liked: true, 
        likes: post.likes 
      });
    }
  } catch (error: any) {
    console.error('Like/Unlike error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
