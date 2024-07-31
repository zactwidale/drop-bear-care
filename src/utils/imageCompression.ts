import imageCompression from 'browser-image-compression';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const compressAndUploadImage = async (
  file: File,
  uid: string
): Promise<string> => {
  const maxSizeKB = 100;
  const maxWidthOrHeight = 1920;

  const compressOptions = {
    maxSizeMB: maxSizeKB / 1024,
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };

  let compressedBlob: Blob = await imageCompression(file, compressOptions);

  let attempts = 0;
  const maxAttempts = 5;

  while (compressedBlob.size > maxSizeKB * 1024 && attempts < maxAttempts) {
    compressOptions.maxSizeMB = compressOptions.maxSizeMB * 0.9;
    compressedBlob = await imageCompression(
      new File([compressedBlob], file.name, { type: compressedBlob.type }),
      compressOptions
    );
    attempts++;
  }

  const compressedFile = new File([compressedBlob], `${file.name}.webp`, {
    type: 'image/webp',
  });

  const storage = getStorage();
  const fileName = `${uuidv4()}.webp`;
  const fileRef = storageRef(storage, `user-photos/${uid}/${fileName}`);

  await uploadBytes(fileRef, compressedFile);
  const downloadURL = await getDownloadURL(fileRef);

  if (typeof downloadURL !== 'string') {
    throw new Error('Download URL is not a string');
  }

  return downloadURL;
};
