import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Item from '@/lib/db/models/Item';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';

function formatItem(item: any) {
  return {
    id: item._id.toString(),
    CultureName: item.CultureName,
    CultureDescription: item.CultureDescription,
    Region: item.Region,
    Significance: item.Significance,
    ImageURL: item.ImageURL,
    VideoURL: item.VideoURL,
    Likes: item.Likes ?? 0,
    Saves: item.Saves ?? 0,
    created_by: item.created_by?.toString() ?? null,
  };
}

// GET /api/items/user/[userId] - Get items created by a user
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

    const items = await Item.find({ created_by: uid }).sort({ createdAt: -1 });
    return NextResponse.json(items.map(formatItem));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
