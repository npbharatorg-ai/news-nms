const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for processing'));
    };
    
    img.src = objectUrl;
  });
};

export const convertAVIFToWebP = async (file) => {
  if (file.type !== 'image/avif') {
    return file;
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const newFileName = file.name.replace(/\.avif$/i, '.webp');
          const webpFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/webp', 0.85);
    });
  } catch (error) {
    console.error('AVIF conversion error:', error);
    throw new Error('Failed to convert AVIF image. Please try a different format.');
  }
};

export const compressImage = async (file, quality = 0.85) => {
  // Skip GIFs as canvas drawing will destroy the animation
  if (file.type === 'image/gif') {
    return file;
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    
    // Maintain aspect ratio (drawing at original size, just compressing quality)
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Determine output type (keep PNG as PNG to preserve transparency, otherwise use JPEG/WebP)
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Image compression failed'));
        }
      }, outputType, quality);
    });
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image.');
  }
};