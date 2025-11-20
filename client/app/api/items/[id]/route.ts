import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Item from '@/lib/db/models/Item';
import User from '@/lib/db/models/User';
import Comment from '@/lib/db/models/Comment';
import { requireAuth } from '@/lib/auth/middleware';
import { updateValidationSchema, sanitizeId, validateObjectId } from '@/lib/utils/validation';
import { handleFileUploads } from '@/lib/utils/file-upload';
import { deleteItemAssets } from '@/lib/utils/cloudinary-delete';

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

// GET /api/items/[id] - Get single item
export async function GET(
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
        { message: 'Item not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatItem(item));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/items/[id] - Update item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { id } = await params;
    const itemId = sanitizeId(id);

    if (!validateObjectId(itemId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found.' },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const bodyCreatorId = sanitizeId(formData.get('created_by') as string);
    const creatorId = user.id || bodyCreatorId || item.created_by.toString();

    if (!validateObjectId(creatorId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const payload = {
      CultureName: formData.get('CultureName') as string,
      CultureDescription: formData.get('CultureDescription') as string,
      Region: formData.get('Region') as string,
      Significance: formData.get('Significance') as string,
      created_by: creatorId,
    };

    const { error, value } = updateValidationSchema.validate(payload);
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

    item.CultureName = value.CultureName;
    item.CultureDescription = value.CultureDescription;
    item.Region = value.Region;
    item.Significance = value.Significance;
    item.created_by = new mongoose.Types.ObjectId(value.created_by);

    const { image, video } = await handleFileUploads(formData);

    // Delete old Cloudinary assets if new ones are uploaded
    if (image && item.ImageURL) {
      deleteItemAssets(item.ImageURL, null).catch((err) =>
        console.error('Failed to delete old image:', err)
      );
    }
    if (video && item.VideoURL) {
      deleteItemAssets(null, item.VideoURL).catch((err) =>
        console.error('Failed to delete old video:', err)
      );
    }

    if (image) item.ImageURL = image;
    if (video) item.VideoURL = video;

    await item.save();

    return NextResponse.json({
      message: 'Item updated successfully!',
      item: formatItem(item),
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/items/[id] - Delete item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const itemId = sanitizeId(id);

    if (!validateObjectId(itemId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deletedItem = await Item.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return NextResponse.json(
        { message: 'Item not found.' },
        { status: 404 }
      );
    }

    // Delete associated comments
    await Comment.deleteMany({ item: itemId });

    // Delete Cloudinary assets in background (don't await)
    deleteItemAssets(deletedItem.ImageURL, deletedItem.VideoURL).catch((err) =>
      console.error('Failed to delete Cloudinary assets:', err)
    );

    return NextResponse.json({ message: 'Item deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
