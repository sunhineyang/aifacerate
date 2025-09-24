'use client';

import { useState } from 'react';
import { Star, RotateCcw, Download, User, Sparkles } from 'lucide-react';
import { AdaptiveImage } from './adaptive-image';

export interface AnalysisResult {
  score: number;
  stars: number;
  age: number;
  celebrity: {
    name: string;
    country: string;
  };
  comment: string;
  features: {
    eyes: string;
    nose: string;
    smile: string;
    face: string;
  };
}

export interface ResultDisplayProps {
  image: string | null;
  result: AnalysisResult;
  onRestart: () => void;
  onShare: () => void;
  pageData?: any;
}

// 绘制星星的辅助函数
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillColor: string = '#2563eb',
  strokeColor: string = '#2563eb',
  strokeWidth: number = 0
) {
  const spikes = 5;
  const outerRadius = radius;
  const innerRadius = radius * 0.4;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const px = Math.cos(angle - Math.PI / 2) * r;
    const py = Math.sin(angle - Math.PI / 2) * r;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  
  // 填充星星
  if (fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  
  // 描边星星
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  
  ctx.restore();
}

export function ResultDisplay({ image, result, onRestart, onShare, pageData }: ResultDisplayProps) {
  const [removeWatermark, setRemoveWatermark] = useState(false);

  // 渲染星级
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 ${
          index < rating 
            ? 'text-primary fill-primary' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto">
        {/* 结果卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* 用户照片 */}
          {image && (
            <AdaptiveImage
              src={image}
              alt="分析照片"
              maxHeight={320}
              showBackground={true}
              className="w-full"
            />
          )}
          
          {/* 卡片内容 */}
          <div className="p-6 text-center">
            {/* 评分 */}
            <div className="mb-4">
              <div className="text-5xl font-bold text-primary mb-2">
                {result.score.toFixed(1)}
              </div>
              <div className="flex justify-center mb-3">
                {renderStars(result.stars)}
              </div>
            </div>
            
            {/* 年龄信息 */}
            <div className="flex items-center justify-center mb-4 text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">{pageData?.result?.ageLabel || 'Facial Age'}: {result.age}</span>
            </div>
            
            {/* 明星相似度 */}
            <div className="flex items-center justify-center mb-6 text-muted-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {pageData?.result?.celebrity?.label || 'Celebrity Look-alike'}: {' '}
                {pageData?.result?.celebrity?.format
                  ? pageData.result.celebrity.format
                      .replace('{name}', result.celebrity.name)
                      .replace('{country}', result.celebrity.country)
                  : `${result.celebrity.name} (${result.celebrity.country})`
                }
              </span>
            </div>
            
            {/* 金句评语 */}
            <div className="mb-6">
              <div className="relative">
                <div className="text-4xl text-primary/30 absolute -top-2 -left-2">&ldquo;</div>
                <div className="text-4xl text-primary/30 absolute -bottom-6 -right-2">&rdquo;</div>
                <p className="text-card-foreground text-base leading-relaxed px-4">
                  {result.comment}
                </p>
              </div>
            </div>
            
            {/* 网站水印 */}
            {!removeWatermark && (
              <div className="text-muted-foreground text-sm">
                {pageData?.result?.watermark || 'aifacerate.com'}
              </div>
            )}
          </div>
        </div>
        
        {/* 操作按钮区域 */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              // 下载高清图片功能 - 完全按照页面结构绘制
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx && image) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  // 计算图片实际显示尺寸（模拟AdaptiveImage逻辑）
                  const imageAspectRatio = img.width / img.height;
                  const containerWidth = 400; // AdaptiveImage容器宽度
                  const maxHeight = 320; // AdaptiveImage maxHeight
                  const calculatedHeight = containerWidth / imageAspectRatio;
                  const actualPhotoHeight = Math.max(200, Math.min(calculatedHeight, maxHeight)); // 最小200px，最大320px
                  
                  // 设置画布尺寸 - 按照页面max-w-md (448px)宽度
                  canvas.width = 448;
                  const cardPadding = 24; // p-6 = 24px
                  const estimatedContentHeight = 350; // 预估内容高度：评分(60) + 星级(44) + 年龄(25) + 明星(40) + 评语(120) + 水印(40) + 间距
                  canvas.height = actualPhotoHeight + estimatedContentHeight + cardPadding * 2;
                  
                  // 绘制卡片背景（白色，圆角24px，阴影）
                  const borderRadius = 24; // rounded-3xl
                  ctx.save();
                  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
                  ctx.shadowBlur = 25;
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 10;
                  ctx.fillStyle = '#ffffff';
                  ctx.beginPath();
                  ctx.roundRect(0, 0, canvas.width, canvas.height, borderRadius);
                  ctx.fill();
                  ctx.restore();
                  
                  // 设置卡片区域变量
                  const cardX = 0;
                  const cardY = 0;
                  const cardWidth = canvas.width;
                  const cardHeight = canvas.height;
                  
                  // 设置裁剪区域为圆角矩形
                  ctx.save();
                  ctx.beginPath();
                  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, borderRadius);
                  ctx.clip();
                  
                  // 绘制照片区域 - 使用计算出的实际高度
                  const photoY = cardY;
                  const photoWidth = cardWidth;
                  const photoHeight = actualPhotoHeight;
                  
                  // 判断是否需要背景（竖图需要背景）
                  const needsBackground = imageAspectRatio < 0.8;
                  
                  if (needsBackground) {
                    // 绘制渐变背景
                    const gradient = ctx.createLinearGradient(cardX, photoY, cardX + photoWidth, photoY + photoHeight);
                    gradient.addColorStop(0, '#f9fafb');
                    gradient.addColorStop(0.5, '#f3f4f6');
                    gradient.addColorStop(1, '#f9fafb');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(cardX, photoY, photoWidth, photoHeight);
                    
                    // 绘制背景模糊图片
                    ctx.save();
                    ctx.globalAlpha = 0.2;
                    ctx.filter = 'blur(8px)';
                    ctx.drawImage(img, cardX - photoWidth * 0.05, photoY - photoHeight * 0.05, photoWidth * 1.1, photoHeight * 1.1);
                    ctx.restore();
                  } else {
                    // 白色背景
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(cardX, photoY, photoWidth, photoHeight);
                  }
                  
                  // 计算主图片的显示尺寸（object-contain效果）
                  let drawWidth, drawHeight, drawX, drawY;
                  
                  if (imageAspectRatio > photoWidth / photoHeight) {
                    // 图片较宽，以宽度为准
                    drawWidth = photoWidth;
                    drawHeight = drawWidth / imageAspectRatio;
                    drawX = cardX;
                    drawY = photoY + (photoHeight - drawHeight) / 2;
                  } else {
                    // 图片较高，以高度为准
                    drawHeight = photoHeight;
                    drawWidth = drawHeight * imageAspectRatio;
                    drawX = cardX + (photoWidth - drawWidth) / 2;
                    drawY = photoY;
                  }
                  
                  // 绘制主图片
                  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                  ctx.restore();
                  
                  // 设置文本对齐和基线
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  
                  // 绘制内容区域 - 按照页面p-6 (24px)边距
                  const contentY = photoY + photoHeight + cardPadding;
                  const contentX = cardX + cardPadding;
                  const contentWidth = cardWidth - cardPadding * 2;
                  
                  // 当前Y坐标
                  let currentY = contentY;
                  
                  // 绘制评分 - text-5xl (48px) font-bold text-blue-600
                  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb'; // text-blue-600
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  const scoreText = result.score.toString();
                  ctx.fillText(scoreText, cardX + cardWidth / 2, currentY);
                  currentY += 60; // 评分后间距
                  
                  // 绘制星级评分 - w-6 h-6 (24px) 蓝色星星
                  const starSize = 24;
                  const starSpacing = 8; // 星星间距
                  const totalStarsWidth = 5 * starSize + 4 * starSpacing;
                  const starsStartX = cardX + (cardWidth - totalStarsWidth) / 2;
                  const starsY = currentY;
                  
                  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';
                  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim() || '#d1d5db';
                  
                  for (let i = 0; i < 5; i++) {
                    const starX = starsStartX + i * (starSize + starSpacing);
                    const filled = i < Math.floor(result.score);
                    
                    if (filled) {
                      // 绘制实心星星
                      drawStar(ctx, starX + starSize/2, starsY + starSize/2, starSize/2, primaryColor);
                    } else {
                      // 绘制空心星星
                      drawStar(ctx, starX + starSize/2, starsY + starSize/2, starSize/2, 'transparent', mutedColor, 1);
                    }
                  }
                  currentY += starSize + 20; // 星级后间距
                  
                  // 绘制年龄信息 - text-sm (14px) text-gray-600
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim() || '#4b5563'; // text-gray-600
                  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                  ctx.textAlign = 'left';
                  ctx.textBaseline = 'top';
                  
                  const ageText = `${pageData?.result?.ageLabel || 'Facial Age'}: ${result.age}`;
                  const ageTextWidth = ctx.measureText(ageText).width;
                  const ageStartX = cardX + (cardWidth - ageTextWidth - 20) / 2; // 居中但为图标留出空间
                  
                  // 绘制简化的User图标（在文字左侧）
                  const userIconX = ageStartX - 16;
                  const userIconY = currentY + 7;
                  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim() || '#4b5563';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.arc(userIconX, userIconY, 6, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.arc(userIconX, userIconY + 12, 10, -Math.PI/3, -2*Math.PI/3, true);
                  ctx.stroke();
                  
                  ctx.fillText(ageText, ageStartX, currentY);
                  currentY += 25; // 年龄信息后间距
                  
                  // 绘制明星相似度信息 - text-sm (14px) text-gray-600
                  const celebrityText = pageData?.result?.celebrity?.format
                    ? pageData.result.celebrity.format
                        .replace('{name}', result.celebrity.name)
                        .replace('{country}', result.celebrity.country)
                    : `${result.celebrity.name} (${result.celebrity.country})`;
                  const celebrityLabel = pageData?.result?.celebrity?.label || 'Celebrity Look-alike';
                  const fullCelebrityText = celebrityLabel + ': ' + celebrityText;
                  
                  const celebrityTextWidth = ctx.measureText(fullCelebrityText).width;
                  const celebrityStartX = cardX + (cardWidth - celebrityTextWidth - 20) / 2; // 居中但为图标留出空间
                  
                  // 绘制简化的Sparkles图标（在文字左侧）
                  const sparkleIconX = celebrityStartX - 16;
                  const sparkleIconY = currentY + 7;
                  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim() || '#4b5563';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  // 主要十字星
                  ctx.moveTo(sparkleIconX - 6, sparkleIconY);
                  ctx.lineTo(sparkleIconX + 6, sparkleIconY);
                  ctx.moveTo(sparkleIconX, sparkleIconY - 6);
                  ctx.lineTo(sparkleIconX, sparkleIconY + 6);
                  // 对角线小星
                  ctx.moveTo(sparkleIconX - 3, sparkleIconY - 3);
                  ctx.lineTo(sparkleIconX + 3, sparkleIconY + 3);
                  ctx.moveTo(sparkleIconX + 3, sparkleIconY - 3);
                  ctx.lineTo(sparkleIconX - 3, sparkleIconY + 3);
                  ctx.stroke();
                  
                  ctx.fillText(fullCelebrityText, celebrityStartX, currentY);
                  currentY += 40; // 明星信息后间距
                  
                  // 绘制金句评语区域 - text-base (16px) text-gray-700 leading-relaxed px-4
                  const commentMaxWidth = contentWidth - 32; // 减去px-4的左右边距
                  
                  // 绘制上引号 - 淡蓝色
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() + '80' || '#93c5fd'; // blue-300 淡蓝色
                  ctx.font = 'bold 24px Georgia, serif';
                  ctx.textAlign = 'left';
                  const quoteStartX = contentX + 16; // px-4 = 16px
                  ctx.fillText('"', quoteStartX, currentY);
                  
                  // 设置评语文本样式
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-foreground').trim() || '#374151'; // text-gray-700
                  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  
                  // 文本换行处理
                  const lines = [];
                  let currentLine = '';
                  const chars = result.comment.split('');
                  
                  for (let i = 0; i < chars.length; i++) {
                    const testLine = currentLine + chars[i];
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > commentMaxWidth && currentLine.length > 0) {
                      lines.push(currentLine);
                      currentLine = chars[i];
                    } else {
                      currentLine = testLine;
                    }
                  }
                  if (currentLine) {
                    lines.push(currentLine);
                  }
                  
                  // 绘制文本行 - leading-relaxed (line-height: 1.625)
                  const lineHeight = 26; // 16px * 1.625
                  let textY = currentY + 30; // 增加与上引号的间距
                  lines.forEach((line, index) => {
                    ctx.fillText(line, cardX + cardWidth / 2, textY + index * lineHeight);
                  });
                  
                  // 绘制下引号 - 淡蓝色
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() + '80' || '#93c5fd'; // blue-300 淡蓝色
                  ctx.font = 'bold 24px Georgia, serif';
                  ctx.textAlign = 'right';
                  const quoteEndX = contentX + contentWidth - 16; // px-4 = 16px
                  const quoteEndY = textY + lines.length * lineHeight + 20; // 增加与内容的间距
                  ctx.fillText('"', quoteEndX, quoteEndY);
                  
                  currentY = quoteEndY + 30; // 评语后间距
                  
                  // 绘制网站水印 - text-sm (14px) text-gray-400
                  if (!removeWatermark) {
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim() || '#9ca3af'; // text-gray-400
                    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(pageData?.result?.watermark || 'aifacerate.com', cardX + cardWidth / 2, currentY + 20);
                  }
                  
                  // 下载高质量图片 - 使用原始文件名
                  const link = document.createElement('a');
                  // 获取原始文件名（去除扩展名）并添加新的后缀
                  const originalFileName = image.split('/').pop()?.split('.')[0] || 'photo';
                  link.download = `${originalFileName}_from_aifacerate.com.png`;
                  link.href = canvas.toDataURL('image/png', 0.95);
                  link.click();
                };
                img.src = image;
              }
            }}
            className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-200"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            {pageData?.result?.actions?.download || 'Download HD Image'}
          </button>
          
          <button
            onClick={onRestart}
            className="w-full bg-secondary text-secondary-foreground py-3 px-6 rounded-xl font-medium hover:bg-secondary/90 transition-colors duration-200"
          >
            <RotateCcw className="w-5 h-5 mr-2 inline" />
            {pageData?.result?.actions?.reanalyze || '重新分析'}
          </button>
          
          {/* 移除水印选项 */}
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <input
              type="checkbox"
              id="removeWatermark"
              checked={removeWatermark}
              onChange={(e) => setRemoveWatermark(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
            />
            <label htmlFor="removeWatermark" className="text-sm text-card-foreground cursor-pointer">
              {pageData?.result?.actions?.removeWatermark || '移除水印'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}