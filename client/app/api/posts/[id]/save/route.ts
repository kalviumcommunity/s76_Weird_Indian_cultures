import { NextRequest, NextResponse } from 'next/server';
import PostModel from '@/lib/db/models/PostModel';
import { authenticate } from '@/lib/auth/middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = authUser.id;

    // Check if already saved
    const isSaved = await PostModel.hasSaved(userId, id);

    if (isSaved) {
      // Unsave
      await PostModel.unsave(id, userId);
      return NextResponse.json({
        message: 'Post removed from saved',
        saved: false,
      });
    } else {
      // Save
      await PostModel.save(id, userId);
      return NextResponse.json({
        message: 'Post saved',
        saved: true,
      });
    }
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
