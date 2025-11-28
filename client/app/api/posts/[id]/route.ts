import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import User from '@/lib/db/models/User';
import Comment from '@/lib/db/models/Comment';
import { requireAuth } from '@/lib/auth/middleware';
import { updateValidationSchema, sanitizeId, validateObjectId } from '@/lib/utils/validation';
import { handleFileUploads } from '@/lib/utils/file-upload';
import { deleteItemAssets } from '@/lib/utils/cloudinary-delete';

function formatPost(post: any) {
  return {
    id: post._id.toString(),
    caption: post.caption,
    location: post.location,
    tags: post.tags,
    imageUrl: post.imageUrl,
    videoUrl: post.videoUrl,
    likes: post.likes ?? 0,
    saves: post.saves ?? 0,
    created_by: post.created_by?.toString() ?? null,
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

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json(formatPost(post));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { id } = await params;
    const postId = sanitizeId(id);

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    const formData = await req.formData();
    const bodyCreatorId = sanitizeId(formData.get('created_by') as string);
    const creatorId = user.id || bodyCreatorId || post.created_by.toString();

    if (!validateObjectId(creatorId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const payload = {
      caption: formData.get('caption') as string,
      location: formData.get('location') as string || '',
      tags: formData.get('tags') as string || '',
      created_by: creatorId,
    };

    const { error, value } = updateValidationSchema.validate(payload);
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const creator = await User.findById(value.created_by);
    if (!creator) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    post.caption = value.caption;
    post.location = value.location || '';
    post.tags = value.tags || '';
    post.created_by = new mongoose.Types.ObjectId(value.created_by);

    const { image, video } = await handleFileUploads(formData);

    if (image && post.imageUrl) {
      deleteItemAssets(post.imageUrl, null).catch((err) => console.error('Failed to delete old image:', err));
    }
    if (video && post.videoUrl) {
      deleteItemAssets(null, post.videoUrl).catch((err) => console.error('Failed to delete old video:', err));
    }

    if (image) post.imageUrl = image;
    if (video) post.videoUrl = video;

    await post.save();

    return NextResponse.json({ message: 'Post updated successfully!', post: formatPost(post) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const postId = sanitizeId(id);

    if (!validateObjectId(postId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    await Comment.deleteMany({ item: postId });
    deleteItemAssets(deletedPost.imageUrl, deletedPost.videoUrl).catch((err) =>
      console.error('Failed to delete Cloudinary assets:', err)
    );

    return NextResponse.json({ message: 'Post deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
