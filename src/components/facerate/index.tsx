'use client';

import { useState, useEffect } from 'react';
import { PhotoUpload } from './photo-upload'
import { AnalysisProgress } from './analysis-progress'
import { ResultDisplay } from './result-display';
import { ShareCard } from './share-card';
import { NotAnalyzableDisplay } from './not-analyzable-display';

import { ErrorDisplay } from './error-display';
import { getFaceratePage } from '@/services/page';
import { useAnalyze, convertToBase64, validateImageFile } from '@/hooks/useAnalyze';

// 导入分析结果类型
import type { AnalysisResult } from '@/hooks/useAnalyze';

export interface FaceRateProps {
  locale?: string;
}

export default function FaceRate({ locale = 'en' }: FaceRateProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'result' | 'share' | 'not-analyzable'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // 使用API调用Hook
  const { analyze, loading, error, clearError } = useAnalyze();

  // 加载多语言数据
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const data = await getFaceratePage(locale);
        setPageData(data);
      } catch (error) {
        console.error('Failed to load facerate page data:', error);
      }
    };
    loadPageData();
  }, [locale]);

  // 处理照片上传
  const handlePhotoUpload = async (file: File) => {
    try {
      // 验证图片文件
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.error('Invalid image file:', validation.error);
        setValidationError(validation.error || '文件格式不正确');
        return;
      }

      // 清除之前的错误
      clearError();
      setValidationError(null);
      
      // 创建图片预览URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setCurrentStep('analyzing');

      // 同步启动：动画和API调用同时开始
      try {
        // 创建API调用Promise
        const analysisPromise = (async () => {
          const base64 = await convertToBase64(file);
          return await analyze(base64, locale);
        })();
        
        // 创建最小动画时长Promise（3秒）
        const animationPromise = new Promise(resolve => setTimeout(resolve, 3000));
        
        // 等待两者都完成：API调用和最小动画时长
        const [result] = await Promise.all([analysisPromise, animationPromise]);
        
        if (result) {
          setAnalysisResult(result);
          // 根据分析结果决定跳转到哪个页面
          if (result.analyzable === false) {
            setCurrentStep('not-analyzable');
          } else {
            setCurrentStep('result');
          }
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        // 错误会通过useAnalyze Hook自动处理
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // 错误会通过useAnalyze Hook自动处理
    }
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setAnalysisResult(null);
    clearError();
    setValidationError(null);
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
  };

  // 上传新照片（从not-analyzable状态）
  const handleUploadNew = () => {
    handleRestart();
  };

  // 重试分析
  const handleRetry = () => {
    if (uploadedImage) {
      // 从blob URL重新获取文件进行分析
      fetch(uploadedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'retry-image.jpg', { type: blob.type });
          handlePhotoUpload(file);
        })
        .catch(error => {
          console.error('Retry failed:', error);
          handleRestart();
        });
    } else {
      handleRestart();
    }
  };

  // 分享结果
  const handleShare = () => {
    setCurrentStep('share');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageData?.title || 'AI Face Rating'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {pageData?.subtitle || 'Upload your photo and get an AI-powered attractiveness score'}
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {currentStep === 'upload' && (
            <div>
              <PhotoUpload onUpload={handlePhotoUpload} pageData={pageData} />
              {validationError && (
                <div className="mx-8 mb-8">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <div className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-red-800 font-medium mb-1">{pageData?.errors?.uploadFailed || '上传失败'}</h4>
                      <p className="text-red-700 text-sm">{validationError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'analyzing' && (
            error ? (
              <ErrorDisplay 
                error={error}
                onRetry={handleRetry}
                onClose={handleRestart}
              />
            ) : (
              <AnalysisProgress image={uploadedImage} pageData={pageData} />
            )
          )}

          {currentStep === 'result' && analysisResult && analysisResult.analyzable !== false && (
            <ResultDisplay
              image={uploadedImage}
              result={analysisResult}
              onRestart={handleRestart}
              onShare={handleShare}
              pageData={pageData}
            />
          )}

          {currentStep === 'not-analyzable' && analysisResult && !analysisResult.analyzable && (
            <NotAnalyzableDisplay
              message={analysisResult.message || '无法分析此图片，请尝试上传其他照片'}
              onRetry={handleRetry}
              onUploadNew={handleUploadNew}
            />
          )}

          {currentStep === 'share' && analysisResult && (
            <ShareCard
              image={uploadedImage}
              result={analysisResult}
              onBack={() => setCurrentStep('result')}
              onRestart={handleRestart}
              pageData={pageData}
            />
          )}
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>{pageData?.upload?.privacy || 'Your photo will not be saved or shared without your consent'}</p>
        </div>
      </div>
    </div>
  );
}