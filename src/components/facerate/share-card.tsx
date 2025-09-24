'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Download, Copy, Share2, Star, Sparkles, RotateCcw } from 'lucide-react';
import { AnalysisResult } from './result-display';

export interface ShareCardProps {
  image: string | null;
  result: AnalysisResult;
  onBack: () => void;
  onRestart: () => void;
  pageData?: any;
}

export function ShareCard({ image, result, onBack, onRestart, pageData }: ShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 根据分数获取等级和颜色
  const getScoreLevel = (score: number) => {
    if (score >= 9) return { level: '绝美', color: 'from-purple-500 to-pink-500' };
    if (score >= 8) return { level: '很美', color: 'from-blue-500 to-purple-500' };
    if (score >= 7) return { level: '漂亮', color: 'from-green-500 to-blue-500' };
    if (score >= 6) return { level: '好看', color: 'from-yellow-500 to-green-500' };
    return { level: '普通', color: 'from-gray-500 to-gray-600' };
  };

  const scoreLevel = getScoreLevel(result.score);

  // 渲染星级
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // 生成分享卡片图片
  const generateShareImage = async () => {
    if (!cardRef.current || !image) return;
    
    setIsGenerating(true);
    
    try {
      // 使用 html2canvas 库的替代方案 - 创建 canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // 设置画布尺寸
      canvas.width = 600;
      canvas.height = 800;
      
      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 600, 800);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 800);
      
      // 加载并绘制用户照片
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // 绘制圆形头像
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 200, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 220, 120, 160, 160);
        ctx.restore();
        
        // 绘制白色卡片背景
        ctx.fillStyle = 'white';
        ctx.roundRect(50, 320, 500, 400, 20);
        ctx.fill();
        
        // 绘制评分
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(result.score.toFixed(1), 300, 400);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('/10 分', 300, 430);
        
        // 绘制等级
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText(scoreLevel.level, 300, 470);
        
        // 绘制年龄
        ctx.font = '18px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`预测年龄: ${result.age} 岁`, 300, 510);
        
        // 绘制特征分析
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#374151';
        
        const features = [
          `眼部: ${result.features.eyes}`,
          `鼻部: ${result.features.nose}`,
          `笑容: ${result.features.smile}`,
          `脸型: ${result.features.face}`
        ];
        
        features.forEach((feature, index) => {
          ctx.fillText(feature, 80, 560 + index * 25);
        });
        
        // 绘制底部标识
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('AI 颜值评分 - 仅供娱乐参考', 300, 690);
        
        // 下载图片
        const link = document.createElement('a');
        link.download = 'facerate-share-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setIsGenerating(false);
      };
      
      img.src = image;
    } catch (error) {
      console.error('生成分享卡片失败:', error);
      setIsGenerating(false);
    }
  };

  // 复制分享文本
  const copyShareText = async () => {
    const shareText = `我在 AI 颜值评分中获得了 ${result.score.toFixed(1)}/10 分！\n\n✨ 等级：${scoreLevel.level}\n🎂 预测年龄：${result.age} 岁\n\n特征分析：\n👁️ ${result.features.eyes}\n👃 ${result.features.nose}\n😊 ${result.features.smile}\n👤 ${result.features.face}\n\n快来测试你的颜值吧！`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // Web Share API
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 颜值评分结果',
          text: `我在 AI 颜值评分中获得了 ${result.score.toFixed(1)}/10 分！`,
          url: window.location.href
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // 降级到复制链接
      copyShareText();
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回结果
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{pageData?.result?.actions?.share || '分享卡片'}</h2>
          <div></div>
        </div>

        {/* 分享卡片预览 */}
        <div 
          ref={cardRef}
          className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100"
        >
          {/* 卡片内容 */}
          <div className="text-center text-gray-900">
            {/* 用户头像 */}
            {image && (
              <div className="mb-6">
                <img
                  src={image}
                  alt="用户照片"
                  className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-gray-200 shadow-lg"
                />
              </div>
            )}

            {/* 评分展示 */}
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2 text-gray-900">
                {result.score.toFixed(1)}
                <span className="text-2xl text-gray-600">/10</span>
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(result.stars)}
              </div>
              <div className="text-xl font-semibold text-blue-600">
                {scoreLevel.level}
              </div>
            </div>

            {/* 年龄预测 */}
            <div className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="text-lg font-medium text-gray-700 mb-1">预测年龄</div>
              <div className="text-2xl font-bold text-gray-900">{result.age} 岁</div>
            </div>

            {/* 特征亮点 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(result.features).map(([key, value]) => {
                const featureNames = {
                  eyes: '👁️ 眼部',
                  nose: '👃 鼻部', 
                  smile: '😊 笑容',
                  face: '👤 脸型'
                };
                
                return (
                  <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-sm text-gray-700 mb-1">
                      {featureNames[key as keyof typeof featureNames]}
                    </div>
                    <div className="text-xs font-medium text-gray-900">{value}</div>
                  </div>
                );
              })}
            </div>

            {/* 底部标识 */}
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 颜值评分 · 仅供娱乐参考
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={generateShareImage}
              disabled={isGenerating}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {isGenerating ? '生成中...' : '下载卡片'}
            </button>
            
            <button
              onClick={copyShareText}
              className={`inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
                copySuccess 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Copy className="w-5 h-5 mr-2" />
              {copySuccess ? '已复制!' : '复制文本'}
            </button>
          </div>
          
          <button
            onClick={shareNative}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Share2 className="w-5 h-5 mr-2" />
            分享到社交媒体
          </button>
          
          <button
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {pageData?.result?.actions?.reanalyze || '重新开始测试'}
          </button>
        </div>

        {/* 分享提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>分享你的结果，邀请朋友一起来测试颜值吧！</p>
        </div>
      </div>
    </div>
  );
}