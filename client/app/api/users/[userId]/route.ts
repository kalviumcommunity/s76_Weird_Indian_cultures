import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { authenticate } from '@/lib/auth/middleware';
import { handleFileUploads } from '@/lib/utils/file-upload';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;
    const user = await User.findById(userId).select('username bio profilePic following followers');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get user's posts
    const Post = (await import('@/lib/db/models/Post')).default;
    const posts = await Post.find({ created_by: userId })
      .select('imageUrl videoUrl likes saves')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      bio: user.bio || '',
      profilePic: user.profilePic || null,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      following: user.following || [],
      followers: user.followers || [],
      posts: posts.map(post => ({
        id: post._id.toString(),
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        likes: post.likes || 0,
        saves: post.saves || 0,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // Authenticate user
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Check if user is updating their own profile
    if (authUser.id !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    const updateData: any = {
      username: username.trim(),
      bio: bio?.trim() || '',
    };

    // Handle profile picture upload
    const { image } = await handleFileUploads(formData);
    if (image) {
      updateData.profilePic = image;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('username bio profilePic');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
