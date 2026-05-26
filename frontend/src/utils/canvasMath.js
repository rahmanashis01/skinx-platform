/**
 * Canvas Math Utilities for Digital Reticle
 * High-fidelity medical image acquisition with precise circle cropping
 */

/**
 * Draws a dark overlay with a transparent circular reticle in the center
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} radius - Reticle circle radius in pixels
 */
export function drawReticleOverlay(ctx, width, height, radius) {
  ctx.save();

  // Fill dark overlay over entire canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, width, height);

  // Create a circular cutout in the center by removing pixels
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Restore composite operation and draw clinical blue border
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = '#2563eb'; // Clinical blue (Tailwind blue-600)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Crops the circular reticle region to a high-fidelity Blob
 * Maintains 95% JPEG quality for diagnostic accuracy
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} radius - Reticle circle radius in pixels
 * @param {string} mimeType - Output MIME type (default: 'image/jpeg')
 * @param {number} quality - JPEG quality 0-1 (default: 0.95)
 * @returns {Promise<Blob>} Promise resolving to cropped image Blob
 */
export async function cropToBlob(
  canvas,
  radius,
  mimeType = 'image/jpeg',
  quality = 0.95
) {
  // Calculate bounding box of the reticle circle
  const diameterPixels = radius * 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const clipStartX = centerX - radius;
  const clipStartY = centerY - radius;

  // Create temporary off-screen canvas sized to the circle bounding box
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = diameterPixels;
  tempCanvas.height = diameterPixels;
  
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Failed to get 2D context from temporary canvas');
  }

  // Draw the center circular portion from main canvas to temp canvas
  // Source: exact center region of main canvas
  // Destination: full temp canvas (0,0 to diameter x diameter)
  tempCtx.drawImage(
    canvas,
    clipStartX,      // Source X
    clipStartY,      // Source Y
    diameterPixels,  // Source width
    diameterPixels,  // Source height
    0,               // Dest X
    0,               // Dest Y
    diameterPixels,  // Dest width
    diameterPixels   // Dest height
  );

  // Convert to Blob with high-fidelity compression
  return new Promise((resolve, reject) => {
    tempCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Helper function to calculate distance between two touch points
 * Useful for 2-finger pinch gesture detection
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {number} Distance in pixels
 */
export function calculateDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Helper function to calculate midpoint between two touch points
 * Useful for 2-finger pinch zoom center calculation
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {Object} Midpoint coordinates {x, y}
 */
export function calculateMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}
