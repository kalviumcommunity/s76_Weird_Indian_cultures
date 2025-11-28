import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import User from '@/lib/db/models/User';
import { postValidationSchema, sanitizeId } from '@/lib/utils/validation';
import { handleFileUploads } from '@/lib/utils/file-upload';
import { authenticate } from '@/lib/auth/middleware';

// Format post for response
function formatPost(post: any, userId?: string) {
  const likedByUser = userId && post.likedBy 
    ? post.likedBy.some((id: any) => id.toString() === userId)
    : false;

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
    likedByCurrentUser: likedByUser,
  };
}

// GET /api/posts - Fetch all posts
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get current user if authenticated
    let currentUserId: string | undefined;
    try {
      const user = authenticate(req);
      currentUserId = user?.id;
    } catch {
      // User not authenticated, continue without user context
    }

    const posts = await Post.find().sort({ createdAt: -1 });
    return NextResponse.json(posts.map(post => formatPost(post, currentUserId)));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/posts - Create new post
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const payload = {
      caption: formData.get('caption') as string,
      location: formData.get('location') as string || '',
      tags: formData.get('tags') as string || '',
      created_by: sanitizeId(formData.get('created_by') as string),
    };

    const { error, value } = postValidationSchema.validate(payload);
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      );
    }

    const creator = await User.findById(value.created_by);
    if (!creator) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { image, video } = await handleFileUploads(formData);

    const post = await Post.create({
      ...value,
      imageUrl: image,
      videoUrl: video,
    });

    return NextResponse.json(
      {
        message: 'Post created successfully!',
        post: formatPost(post),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/posts - Update post
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const postId = sanitizeId(formData.get('_id') as string);

    const payload = {
      caption: formData.get('caption') as string,
      location: formData.get('location') as string || '',
      tags: formData.get('tags') as string || '',
      created_by: sanitizeId(formData.get('created_by') as string),
    };

    const { error, value } = postValidationSchema.validate(payload);
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      );
    }

    const { image, video } = await handleFileUploads(formData);

    const updateData: any = { ...value };
    if (image) updateData.imageUrl = image;
    if (video) updateData.videoUrl = video;

    const post = await Post.findByIdAndUpdate(postId, updateData, { new: true });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Post updated successfully!',
        post: formatPost(post),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
