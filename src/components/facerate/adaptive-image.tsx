'use client';

import { useState, useEffect } from 'react';

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  maxHeight?: number;
  showBackground?: boolean;
}

export function AdaptiveImage({ 
  src, 
  alt, 
  className = '', 
  maxHeight = 320,
  showBackground = true 
}: AdaptiveImageProps) {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      setImageAspectRatio(aspectRatio);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  // 计算容器样式
  const getContainerStyle = () => {
    if (!imageAspectRatio) return { height: `${maxHeight}px` };

    // 标准容器宽度（假设为400px）
    const containerWidth = 400;
    const calculatedHeight = containerWidth / imageAspectRatio;
    
    // 限制最大高度
    const finalHeight = Math.min(calculatedHeight, maxHeight);
    
    return {
      height: `${finalHeight}px`,
      minHeight: '200px' // 设置最小高度
    };
  };

  // 判断是否需要背景填充
  const needsBackground = imageAspectRatio && imageAspectRatio < 0.8; // 竖图需要背景

  return (
    <div 
      className={`
        relative overflow-hidden flex items-center justify-center
        ${showBackground && needsBackground 
          ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50' 
          : 'bg-white'
        }
        ${className}
      `}
      style={getContainerStyle()}
    >
      {/* 背景模糊图片（仅在需要时显示） */}
      {showBackground && needsBackground && imageLoaded && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg opacity-20 scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* 主图片 */}
      <img
        src={src}
        alt={alt}
        className={`
          relative z-10 max-w-full max-h-full object-contain
          ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* 加载状态 */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}