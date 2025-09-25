/**
 * 图片压缩工具函数
 * 用于解决Vercel函数4.5MB请求体大小限制问题
 */

/**
 * 压缩图片到指定大小
 * @param file - 原始图片文件
 * @param maxSizeKB - 最大文件大小（KB），默认3000KB（约3MB）
 * @param quality - 压缩质量（0-1），默认0.8
 * @returns Promise<File> - 压缩后的图片文件
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 3000, // 3MB，留出一些余量给其他请求数据
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 如果文件已经小于限制，直接返回
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // 计算压缩后的尺寸
        const { width, height } = calculateCompressedSize(
          img.width,
          img.height,
          file.size,
          maxSizeKB * 1024
        );

        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        // 转换为blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }

            // 如果压缩后仍然太大，递归降低质量
            if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
              const newFile = new File([blob], file.name, { type: file.type });
              compressImage(newFile, maxSizeKB, quality - 0.1)
                .then(resolve)
                .catch(reject);
              return;
            }

            // 创建新的File对象
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            console.log('图片压缩完成:', {
              原始大小: `${(file.size / 1024).toFixed(2)}KB`,
              压缩后大小: `${(compressedFile.size / 1024).toFixed(2)}KB`,
              压缩率: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
              质量: quality
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 加载图片
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 计算压缩后的图片尺寸
 * @param originalWidth - 原始宽度
 * @param originalHeight - 原始高度
 * @param originalSize - 原始文件大小（字节）
 * @param targetSize - 目标文件大小（字节）
 * @returns {width: number, height: number} - 压缩后的尺寸
 */
function calculateCompressedSize(
  originalWidth: number,
  originalHeight: number,
  originalSize: number,
  targetSize: number
): { width: number; height: number } {
  // 计算压缩比例
  const ratio = Math.sqrt(targetSize / originalSize);
  
  // 应用压缩比例，但不要过度压缩
  const compressionRatio = Math.max(0.3, Math.min(1, ratio));
  
  let width = Math.floor(originalWidth * compressionRatio);
  let height = Math.floor(originalHeight * compressionRatio);
  
  // 确保尺寸不会太小（最小400px宽度）
  if (width < 400) {
    const scale = 400 / width;
    width = 400;
    height = Math.floor(height * scale);
  }
  
  // 确保尺寸不会太大（最大2000px宽度）
  if (width > 2000) {
    const scale = 2000 / width;
    width = 2000;
    height = Math.floor(height * scale);
  }
  
  return { width, height };
}

/**
 * 获取图片的实际尺寸
 * @param file - 图片文件
 * @returns Promise<{width: number, height: number}> - 图片尺寸
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('无法获取图片尺寸'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 检查文件是否需要压缩
 * @param file - 图片文件
 * @param maxSizeKB - 最大文件大小（KB）
 * @returns boolean - 是否需要压缩
 */
export function needsCompression(file: File, maxSizeKB: number = 3000): boolean {
  return file.size > maxSizeKB * 1024;
}