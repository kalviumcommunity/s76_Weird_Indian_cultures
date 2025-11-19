import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Item from '@/lib/db/models/Item';
import { authenticate } from '@/lib/auth/middleware';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';

// PUT /api/items/[id]/like - Like an item
export async function PUT(
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

    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    const user = authenticate(req);

    if (user && validateObjectId(user.id)) {
      const alreadyLiked = item.likedBy.some(
        (likedId) => likedId.toString() === user.id
      );
      if (alreadyLiked) {
        return NextResponse.json({ message: 'Already liked' });
      }
      item.likedBy.push(user.id as any);
      item.Likes = item.likedBy.length;
    } else {
      item.Likes = (item.Likes || 0) + 1;
    }

    await item.save();

    return NextResponse.json({ message: 'Liked!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
