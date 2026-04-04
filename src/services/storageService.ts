import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload.
 * @param path The path in storage where the file should be saved.
 * @param onProgress Optional callback to track upload progress.
 * @returns A promise that resolves to the download URL.
 */
export async function uploadFile(
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Sanitize filename and add timestamp
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `${path}/${Date.now()}_${sanitizedName}`);
    console.log(`Starting upload to path: ${path}/${sanitizedName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      {
        next: (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress for ${file.name}: ${Math.round(progress)}%`);
          if (onProgress) onProgress(progress);
        },
        error: (error) => {
          console.error('Firebase Storage Upload Error Details:', {
            code: error.code,
            message: error.message,
            name: error.name,
            serverResponse: (error as any).serverResponse
          });
          
          let errorMessage = 'Upload failed.';
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'Unauthorized: You do not have permission to upload files. Please ensure you are logged in as admin and rules are correctly set.';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Upload was canceled.';
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage = 'Storage quota exceeded. Please check your Firebase plan.';
          } else if (error.code === 'storage/retry-limit-exceeded') {
            errorMessage = 'Upload timed out. Please check your internet connection.';
          } else if (error.code === 'storage/invalid-checksum') {
            errorMessage = 'File upload failed due to a checksum mismatch.';
          }
          
          reject(new Error(`${errorMessage} (${error.code})`));
        },
        complete: async () => {
          try {
            console.log(`Upload complete for ${file.name}, getting download URL...`);
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`File successfully uploaded and available at: ${downloadURL}`);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL after successful upload:', error);
            reject(error);
          }
        }
      }
    );
  });
}
