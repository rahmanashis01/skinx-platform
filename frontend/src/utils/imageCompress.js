/**
 * Image Compression Utilities
 * Handles high-fidelity compression for medical image acquisition
 */

export async function compressCanvasToBlob(canvas, quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to compress canvas to blob"));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

export async function compressFileToBlob(file, quality = 0.95) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        try {
          const blob = await compressCanvasToBlob(canvas, quality);
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
