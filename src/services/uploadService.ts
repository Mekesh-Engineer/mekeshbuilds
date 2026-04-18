import { realtimeDb } from '@/services/firebase/client';
import { ref, set, get, push } from 'firebase/database';
import { toServiceError } from '@/services/serviceError';

/**
 * Converts a File to a Base64 string for embedding within RTDB
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || '';
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file as a Base64 string to Firebase Realtime Database.
 * Replaces traditional Firebase Storage buckets.
 */
export async function uploadFileToRTDB(file: File, ownerId: string, folder: string = 'general'): Promise<{ dataUrl: string, id: string }> {
  try {
    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'application/octet-stream';
    
    const listRef = ref(realtimeDb, `assets/${ownerId}/${folder}`);
    const newAssetRef = push(listRef);
    const assetId = newAssetRef.key as string;

    await set(newAssetRef, {
      name: file.name,
      mimeType,
      data: base64,
      size: file.size,
      uploadedAt: new Date().toISOString()
    });

    const dataUrl = `data:${mimeType};base64,${base64}`;
    return { dataUrl, id: assetId };
  } catch (error) {
    throw toServiceError(error, "File upload failed");
  }
}

/**
 * Retrieves a file from RTDB as a renderable Data URL
 */
export async function getFileFromRTDB(ownerId: string, folder: string, assetId: string): Promise<string | null> {
  try {
    const assetRef = ref(realtimeDb, `assets/${ownerId}/${folder}/${assetId}`);
    const snapshot = await get(assetRef);
    
    if (snapshot.exists()) {
      const val = snapshot.val();
      return `data:${val.mimeType};base64,${val.data}`;
    }
    return null;
  } catch (error) {
    throw toServiceError(error, "File upload failed");
  }
}
