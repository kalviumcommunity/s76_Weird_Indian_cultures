import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(
  file: File,
  fieldName: string
): Promise<string> {
  await ensureUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${fieldName}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export function validateFileType(file: File): boolean {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const ext = path.extname(file.name).toLowerCase();
  const mimeType = file.type.toLowerCase();

  return (
    allowedTypes.test(ext.substring(1)) &&
    (mimeType.startsWith('image/') || mimeType.startsWith('video/'))
  );
}

export async function handleFileUploads(
  formData: FormData
): Promise<{ image: string | null; video: string | null }> {
  const imageFile = formData.get('image') as File | null;
  const videoFile = formData.get('video') as File | null;

  let imageURL = null;
  let videoURL = null;

  if (imageFile && imageFile.size > 0) {
    if (!validateFileType(imageFile)) {
      throw new Error('Invalid image file type');
    }
    imageURL = await saveFile(imageFile, 'image');
  }

  if (videoFile && videoFile.size > 0) {
    if (!validateFileType(videoFile)) {
      throw new Error('Invalid video file type');
    }
    videoURL = await saveFile(videoFile, 'video');
  }

  return { image: imageURL, video: videoURL };
}
