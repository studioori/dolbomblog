import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let modelsLoading = false;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for ongoing loading
    while (modelsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  modelsLoading = true;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    modelsLoaded = true;
    console.log('Face detection models loaded');
  } catch (error) {
    console.error('Failed to load face detection models:', error);
    throw error;
  } finally {
    modelsLoading = false;
  }
}

function applyPixelatedBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  blurAmount: number = 15
): void {
  // Ensure coordinates are within canvas bounds
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  width = Math.min(canvasWidth - x, Math.floor(width));
  height = Math.min(canvasHeight - y, Math.floor(height));

  if (width <= 0 || height <= 0) return;

  // Get the image data for the face region
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  // Apply pixelation (mosaic effect) - more effective than blur for privacy
  const pixelSize = Math.max(8, Math.floor(Math.min(width, height) / blurAmount));

  for (let py = 0; py < height; py += pixelSize) {
    for (let px = 0; px < width; px += pixelSize) {
      // Calculate average color for this block
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
          const idx = ((py + dy) * width + (px + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Apply average color to all pixels in this block
      for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
          const idx = ((py + dy) * width + (px + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, x, y);
}

export async function detectAndBlurFaces(imageFile: File): Promise<{ 
  blurredFile: File; 
  facesDetected: number;
}> {
  // Ensure models are loaded
  await loadFaceDetectionModels();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Create canvas with original image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        ctx.drawImage(img, 0, 0);

        // Detect faces
        const detections = await faceapi.detectAllFaces(
          canvas,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.3
          })
        );

        console.log(`Detected ${detections.length} faces`);

        // Apply pixelated blur to each detected face with padding
        for (const detection of detections) {
          const box = detection.box;
          // Add 20% padding around the face for better coverage
          const padding = Math.max(box.width, box.height) * 0.2;
          
          applyPixelatedBlur(
            ctx,
            box.x - padding,
            box.y - padding,
            box.width + padding * 2,
            box.height + padding * 2,
            10 // Higher value = more pixelated
          );
        }

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert canvas to blob'));
              return;
            }

            // Create new file with same name
            const blurredFile = new File(
              [blob],
              imageFile.name,
              { type: 'image/jpeg' }
            );

            resolve({
              blurredFile,
              facesDetected: detections.length
            });
          },
          'image/jpeg',
          0.92
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

export async function processImagesWithFaceBlur(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<{ processedFiles: File[]; totalFacesBlurred: number }> {
  const processedFiles: File[] = [];
  let totalFacesBlurred = 0;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    
    try {
      const { blurredFile, facesDetected } = await detectAndBlurFaces(files[i]);
      processedFiles.push(blurredFile);
      totalFacesBlurred += facesDetected;
    } catch (error) {
      console.error(`Failed to process image ${i + 1}:`, error);
      // If face detection fails, use original file
      processedFiles.push(files[i]);
    }
  }

  return { processedFiles, totalFacesBlurred };
}
