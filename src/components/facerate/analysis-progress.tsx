'use client';

import { useState, useEffect } from 'react';
import { Brain, Eye, Smile, Sparkles } from 'lucide-react';

export interface AnalysisProgressProps {
  image: string | null;
  pageData?: any;
}

export function AnalysisProgress({ image, pageData }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const analysisSteps = [
    {
      id: 'face-detection',
      label: pageData?.progress?.steps?.faceDetection?.label || 'Face Detection',
      description: pageData?.progress?.steps?.faceDetection?.description || 'Detecting and locating facial feature points...',
      icon: Eye,
      duration: 800
    },
    {
      id: 'feature-analysis',
      label: pageData?.progress?.steps?.featureAnalysis?.label || 'Feature Analysis',
      description: pageData?.progress?.steps?.featureAnalysis?.description || 'Analyzing facial proportions and symmetry...',
      icon: Brain,
      duration: 1000
    },
    {
      id: 'beauty-scoring',
      label: pageData?.progress?.steps?.beautyScoring?.label || 'Beauty Scoring',
      description: pageData?.progress?.steps?.beautyScoring?.description || 'Scoring based on aesthetic standards...',
      icon: Sparkles,
      duration: 800
    },
    {
      id: 'result-generation',
      label: pageData?.progress?.steps?.reportGeneration?.label || 'Report Generation',
      description: pageData?.progress?.steps?.reportGeneration?.description || 'Generating personalized analysis report...',
      icon: Smile,
      duration: 400
    }
  ];

  useEffect(() => {
    let stepIndex = 0;
    let progressValue = 0;
    
    const runStep = () => {
      if (stepIndex < analysisSteps.length) {
        setCurrentStep(stepIndex);
        
        const step = analysisSteps[stepIndex];
        const stepProgress = 100 / analysisSteps.length;
        const startProgress = stepIndex * stepProgress;
        
        // 动画更新进度条
        const progressInterval = setInterval(() => {
          progressValue += 2;
          const currentStepProgress = Math.min(progressValue, startProgress + stepProgress);
          setProgress(currentStepProgress);
          
          if (progressValue >= startProgress + stepProgress) {
            clearInterval(progressInterval);
            progressValue = startProgress + stepProgress;
            
            // 延迟后进入下一步
            setTimeout(() => {
              stepIndex++;
              runStep();
            }, 200);
          }
        }, step.duration / (stepProgress / 2));
      }
    };
    
    runStep();
  }, []);

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* 上传的图片预览 */}
        {image && (
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <img
                src={image}
                alt="上传的照片"
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white shadow-lg"
              />
              {/* 扫描动画效果 */}
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75"></div>
              <div className="absolute inset-2 rounded-full border-2 border-primary/60 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* 主标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {pageData?.progress?.title || 'Analyzing Your Photo'}
          </h2>
          <p className="text-muted-foreground">
            {pageData?.progress?.subtitle || 'AI is using deep learning algorithms for precise analysis'}
          </p>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{pageData?.progress?.progressLabel || 'Analysis Progress'}</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 分析步骤 */}
        <div className="space-y-4">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent border-2 border-primary' 
                    : isCompleted 
                    ? 'bg-muted border-2 border-border'
                    : 'bg-muted/50 border-2 border-border'
                }`}
              >
                {/* 图标 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : isCompleted 
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isActive ? (
                    <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* 文本内容 */}
                <div className="ml-4 flex-1">
                  <h3 className={`font-medium ${
                    isActive 
                      ? 'text-accent-foreground' 
                      : isCompleted 
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm ${
                    isActive 
                      ? 'text-accent-foreground/80' 
                      : isCompleted 
                      ? 'text-primary/80'
                      : 'text-muted-foreground'
                  }`}>
                    {isCompleted ? (pageData?.progress?.completed || 'Completed') : step.description}
                  </p>
                </div>

                {/* 状态指示 */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-muted border border-border rounded-lg">
            <Sparkles className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">
              {pageData?.progress?.aiProcessing || 'AI is using deep learning algorithms for precise analysis'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}