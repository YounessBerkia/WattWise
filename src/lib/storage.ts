/**
 * WattWise Storage Utilities
 *
 * Export/Import functions for JSON data and image compression.
 */

import { validateImportData } from './validators';

/**
 * Exports data as downloadable JSON file
 * @param jsonData - JSON string from store
 * @param filename - Optional custom filename
 */
export function exportToFile(jsonData: string, filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `wattwise-export-${timestamp}.json`;

  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads JSON file and validates structure
 * @param file - Uploaded file
 * @returns Promise with validated data object
 * @throws Error if file is invalid or validation fails
 */
export async function importFromFile(
  file: File
): Promise<ReturnType<typeof validateImportData>> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      reject(new Error('Nur JSON-Dateien erlaubt'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const validated = validateImportData(jsonData);
        resolve(validated);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Ungültige JSON-Datei'));
        } else {
          reject(new Error('Datenstruktur entspricht nicht dem erwarteten Format'));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Fehler beim Lesen der Datei'));
    };

    reader.readAsText(file);
  });
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Compresses image file to base64
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default 800)
 * @param quality - JPEG quality 0-1 (default 0.7)
 * @returns Promise with compressed base64 string
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if wider than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => {
        reject(new Error('Fehler beim Laden des Bildes'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Fehler beim Lesen der Datei'));
    };

    reader.readAsDataURL(file);
  });
}