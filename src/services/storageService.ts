import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a file to Cloudinary for fast hosting and optimal performance.
 */
export async function uploadFile(
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> {
  // Hardcoded credentials as requested for immediate fix
  const cloudName = 'daen4el1p';
  const uploadPreset = 'ml_default';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `grampanchayat/${path}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}
