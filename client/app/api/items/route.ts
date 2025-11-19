import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Item from '@/lib/db/models/Item';
import User from '@/lib/db/models/User';
import { itemValidationSchema, sanitizeId } from '@/lib/utils/validation';
import { handleFileUploads } from '@/lib/utils/file-upload';

// Format item for response
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

// GET /api/items - Fetch all items
export async function GET() {
  try {
    await connectDB();

    const items = await Item.find().sort({ createdAt: -1 });
    return NextResponse.json(items.map(formatItem));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/items - Create new item
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const payload = {
      CultureName: formData.get('CultureName') as string,
      CultureDescription: formData.get('CultureDescription') as string,
      Region: formData.get('Region') as string,
      Significance: formData.get('Significance') as string,
      created_by: sanitizeId(formData.get('created_by') as string),
    };

    const { error, value } = itemValidationSchema.validate(payload);
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

    const item = await Item.create({
      ...value,
      ImageURL: image,
      VideoURL: video,
    });

    return NextResponse.json(
      {
        message: 'Item created successfully!',
        item: formatItem(item),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
