const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen';
  if (file.size > MAX_SIZE_BYTES) return 'La imagen no puede superar los 5 MB';
  return null;
}

export async function uploadToCloudinary(
  file: File,
  folder = 'psicocms/profiles',
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary no está configurado (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)',
    );
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    throw new Error(`Error al subir la imagen (${res.status})`);
  }

  const data = (await res.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}
