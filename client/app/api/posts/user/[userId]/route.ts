import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Post from '@/lib/db/models/Post';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';

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

// GET /api/posts/user/[userId] - Get posts created by a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;
    const uid = sanitizeId(userId);

    if (!validateObjectId(uid)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const posts = await Post.find({ created_by: uid }).sort({ createdAt: -1 });
    return NextResponse.json(posts.map(formatPost));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
