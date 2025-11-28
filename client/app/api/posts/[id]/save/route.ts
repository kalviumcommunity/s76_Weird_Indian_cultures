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
    const savedIndex = post.savedBy.findIndex((savedId) => savedId.toString() === user.id);
    
    if (savedIndex > -1) {
      // Unsave: remove user from savedBy array
      post.savedBy.splice(savedIndex, 1);
      post.saves = post.savedBy.length;
      await post.save();
      return NextResponse.json({ 
        message: 'Unsaved', 
        saved: false, 
        saves: post.saves 
      });
    } else {
      // Save: add user to savedBy array
      post.savedBy.push(userObjectId);
      post.saves = post.savedBy.length;
      await post.save();
      return NextResponse.json({ 
        message: 'Saved', 
        saved: true, 
        saves: post.saves 
      });
    }
  } catch (error: any) {
    console.error('Save/Unsave error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}