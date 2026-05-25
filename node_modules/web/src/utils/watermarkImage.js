/**
 * Applies a professional watermark to a given canvas.
 * Includes the Navdhiriti Manawadhikar logo, website name, and tagline.
 * 
 * @param {HTMLCanvasElement} sourceCanvas - The original image drawn on a canvas
 * @returns {Promise<HTMLCanvasElement>} - A new canvas with the watermark applied
 */
export const applyWatermarkToCanvas = async (sourceCanvas) => {
  return new Promise((resolve) => {
    const logo = new Image();
    logo.crossOrigin = 'Anonymous';
    
    logo.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(sourceCanvas, 0, 0);

        // Watermark settings
        ctx.globalAlpha = 0.5; // Semi-transparent overlay
        const padding = canvas.width * 0.03;

        // Calculate responsive sizes based on canvas width
        const logoTargetWidth = canvas.width * 0.08;
        const logoRatio = logo.height / logo.width;
        const logoTargetHeight = logoTargetWidth * logoRatio;

        const titleFontSize = Math.max(canvas.width * 0.025, 12);
        const taglineFontSize = Math.max(canvas.width * 0.012, 8);
        const gap = canvas.width * 0.015;

        ctx.font = `900 ${titleFontSize}px Arial, sans-serif`;
        const titleWidth = ctx.measureText('NAVDHIRITI MANAWADHIKAR').width;

        ctx.font = `bold ${taglineFontSize}px Arial, sans-serif`;
        const taglineWidth = ctx.measureText('SACH SAAHAS NYAAY KEE KHABAR SAMACHA').width;

        const textBlockWidth = Math.max(titleWidth, taglineWidth);
        const totalWidth = logoTargetWidth + gap + textBlockWidth;
        const textBlockHeight = titleFontSize + taglineFontSize + (canvas.width * 0.005);
        const totalHeight = Math.max(logoTargetHeight, textBlockHeight);

        // Position at bottom right
        const startX = canvas.width - totalWidth - padding;
        const startY = canvas.height - totalHeight - padding;

        // Draw Logo (vertically centered with text)
        const logoY = startY + (totalHeight - logoTargetHeight) / 2;
        ctx.drawImage(logo, startX, logoY, logoTargetWidth, logoTargetHeight);

        // Draw Text
        const textX = startX + logoTargetWidth + gap;
        const textStartY = startY + (totalHeight - textBlockHeight) / 2;
        const titleY = textStartY + titleFontSize; // baseline
        const taglineY = titleY + taglineFontSize + (canvas.width * 0.005);

        // Text styling with shadow for readability on light backgrounds
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = Math.max(canvas.width * 0.004, 3);
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = 'white';

        ctx.font = `900 ${titleFontSize}px Arial, sans-serif`;
        ctx.fillText('NAVDHIRITI MANAWADHIKAR', textX, titleY);

        ctx.font = `bold ${taglineFontSize}px Arial, sans-serif`;
        ctx.fillText('SACH SAAHAS NYAAY KEE KHABAR SAMACHA', textX, taglineY);

        // Reset alpha and shadow
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = 'transparent';

        resolve(canvas);
      } catch (err) {
        console.error('Error drawing watermark:', err);
        resolve(sourceCanvas); // Fallback to original canvas
      }
    };
    
    logo.onerror = () => {
      console.error('Failed to load watermark logo');
      resolve(sourceCanvas); // Fallback to original canvas if logo fails
    };
    
    logo.src = 'https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/eedaa24b0d1f32d6447bcf3dfdb57d41.jpg';
  });
};

/**
 * Generates a watermarked image data URL from a source image URL.
 * Useful for displaying watermarked images directly in <img> tags.
 * 
 * @param {string} imageUrl - The source image URL
 * @returns {Promise<string>} - Base64 data URL of the watermarked image
 */
export const generateWatermarkedImageUrl = async (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const watermarkedCanvas = await applyWatermarkToCanvas(canvas);
        resolve(watermarkedCanvas.toDataURL('image/jpeg', 0.9));
      } catch (e) {
        console.error('Watermark generation failed:', e);
        resolve(imageUrl); // fallback to original
      }
    };
    
    img.onerror = (err) => {
      console.error('Failed to load source image for watermarking', err);
      resolve(imageUrl); // fallback to original
    };
    
    // Cache buster to avoid CORS issues with previously cached images
    img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();
  });
};

/**
 * Applies watermark to a File object and returns a new File and preview URL.
 * Useful for file uploads.
 * 
 * @param {File} imageFile - The source image file
 * @returns {Promise<{file: File, previewUrl: string}>}
 */
export const applyWatermark = async (imageFile) => {
  return new Promise((resolve, reject) => {
    if (!imageFile) {
      reject(new Error('No image file provided'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const watermarkedCanvas = await applyWatermarkToCanvas(canvas);
        
        watermarkedCanvas.toBlob((blob) => {
          if (blob) {
            const watermarkedFile = new File([blob], `watermarked_${imageFile.name}`, {
              type: imageFile.type,
              lastModified: Date.now(),
            });
            URL.revokeObjectURL(objectUrl);
            resolve({ file: watermarkedFile, previewUrl: URL.createObjectURL(blob) });
          } else {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Canvas to Blob failed'));
          }
        }, imageFile.type, 0.9);
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load original image'));
    };
    
    img.src = objectUrl;
  });
};