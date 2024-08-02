import { compressAndUploadImage } from './imageCompression';
import defaultAvatarSrc from '@/assets/default-avatar.png';

const generateVibrantColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 90 + Math.random() * 10; // 90-100%
  const lightness = 45 + Math.random() * 15; // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateAndUploadRandomAvatar = async (
  uid: string
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 500; // Size of the avatar
  canvas.width = size;
  canvas.height = size;

  // Generate background color
  const bgColor = generateVibrantColor();
  ctx!.fillStyle = bgColor;
  ctx!.fillRect(0, 0, size, size);

  // Load and draw image
  const baseImg = new Image();
  baseImg.src = defaultAvatarSrc.src;
  await new Promise((resolve, reject) => {
    baseImg.onload = resolve;
    baseImg.onerror = reject;
  });

  // Calculate position to center the image
  const scale = Math.min(size / baseImg.width, size / baseImg.height) * 0.9;
  const x = (size - baseImg.width * scale) / 2;
  const y = (size - baseImg.height * scale) / 2;

  ctx!.drawImage(baseImg, x, y, baseImg.width * scale, baseImg.height * scale);

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/webp');
  });

  // Create a File object from the blob
  const file = new File([blob], 'default-avatar.webp', { type: 'image/webp' });

  // Use the existing compressAndUploadImage function
  const downloadURL = await compressAndUploadImage(file, uid);

  return downloadURL;
};
