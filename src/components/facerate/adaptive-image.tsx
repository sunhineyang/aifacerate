'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // 懒加载 - 使用 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 图片预加载和错误处理
  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    const abortController = new AbortController();

    const loadImage = async () => {
      try {
        // 预加载主图片
        const img = new Image();
        img.crossOrigin = 'anonymous'; // 支持跨域
        
        const imageLoadPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = src;
        });

        await imageLoadPromise;
        
        if (isMounted && !abortController.signal.aborted) {
          setImageLoaded(true);
          setImageError(false);
        }

        // 预加载背景图片（延迟加载以优化性能）
        if (showBackground && isMounted && !abortController.signal.aborted) {
          setTimeout(() => {
            if (isMounted && !abortController.signal.aborted) {
              setBackgroundLoaded(true);
            }
          }, 100);
        }
      } catch (error) {
        if (isMounted && !abortController.signal.aborted) {
          setImageError(true);
          console.warn('Image loading failed:', error);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [src, showBackground, isInView]);

  // 内存优化 - 清理函数
  useEffect(() => {
    return () => {
      // 清理图片引用以释放内存
      if (imageRef.current) {
        imageRef.current.src = '';
      }
    };
  }, []);

  // 错误重试功能
  const handleRetry = useCallback(() => {
    setImageError(false);
    setImageLoaded(false);
    setBackgroundLoaded(false);
    setIsInView(true); // 触发重新加载
  }, []);

  // 如果图片还未进入视口，显示占位符
  if (!isInView) {
    return (
      <div 
        ref={containerRef}
        className={`
          relative overflow-hidden bg-gray-100 flex items-center justify-center
          ${className}
        `}
        style={{
          height: `${maxHeight}px`,
          minHeight: '240px'
        }}
      >
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 如果图片加载失败，显示错误状态
  if (imageError) {
    return (
      <div 
        ref={containerRef}
        className={`
          relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center
          ${className}
        `}
        style={{
          height: `${maxHeight}px`,
          minHeight: '240px'
        }}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm mb-2">图片加载失败</p>
          <button 
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`
        relative overflow-hidden bg-gray-100
        ${className}
      `}
      style={{
        height: `${maxHeight}px`,
        minHeight: '240px'
      }}
    >
      {/* 背景层 - 模糊透明效果 */}
      {imageLoaded && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
          style={{ filter: 'blur(8px)' }}
        />
      )}
      
      {/* 前景层 - 完整显示图片 */}
      {imageLoaded && (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="relative z-10 w-full h-full object-contain transition-opacity duration-300"
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* 可选：添加渐变边缘效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      
      {/* 加载状态 */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}