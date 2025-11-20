# Cloudinary Integration

This application uses Cloudinary for image and video storage.

## Features

✅ **Automatic Upload**: Images and videos are automatically uploaded to Cloudinary when creating/updating items
✅ **Optimized Delivery**: Images are automatically optimized and resized
✅ **Asset Management**: Old assets are automatically deleted when updated
✅ **CDN Delivery**: Fast content delivery through Cloudinary's CDN

## Configuration

Add these environment variables to your `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=djvqpzwgi
CLOUDINARY_API_KEY=463235376696218
CLOUDINARY_API_SECRET=c23kPIz_zhB1UqfwXyns-S718Ek
CLOUDINARY_URL=cloudinary://463235376696218:c23kPIz_zhB1UqfwXyns-S718Ek@djvqpzwgi
```

## File Structure

```
client/
├── lib/
│   ├── cloudinary.ts              # Cloudinary configuration
│   └── utils/
│       ├── file-upload.ts         # Upload handler (uses Cloudinary)
│       └── cloudinary-delete.ts   # Delete handler for cleanup
```

## Upload Settings

### Images
- **Max dimensions**: 1000x1000px (maintains aspect ratio)
- **Quality**: Auto-optimized
- **Formats**: JPEG, PNG, GIF
- **Storage folder**: `cultura_connect/`

### Videos
- **Max dimensions**: 1920x1080px
- **Quality**: Auto-optimized
- **Formats**: MP4, MOV, AVI, WEBM
- **Storage folder**: `cultura_connect/`

## How It Works

1. **Upload**: When a user uploads an image/video, it's sent to Cloudinary via the API
2. **URL Storage**: Cloudinary returns a secure URL which is stored in MongoDB
3. **Delivery**: Images are served from Cloudinary's CDN (res.cloudinary.com)
4. **Cleanup**: When an item is deleted or updated, old assets are removed from Cloudinary

## API Endpoints That Handle Uploads

- `POST /api/items` - Create item with uploads
- `PUT /api/items/[id]` - Update item with new uploads
- `DELETE /api/items/[id]` - Delete item and cleanup assets

## Usage Example

```typescript
// In your form component
const formData = new FormData();
formData.append('CultureName', 'Diwali');
formData.append('image', imageFile);
formData.append('video', videoFile);

await axios.post('/api/items', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## Benefits

1. **No Server Storage**: Files are not stored on your server
2. **Automatic Optimization**: Images are compressed and optimized
3. **Fast Loading**: CDN delivery ensures fast load times globally
4. **Transformations**: Easy to apply transformations (resize, crop, etc.)
5. **Scalability**: Handles unlimited files without server constraints
