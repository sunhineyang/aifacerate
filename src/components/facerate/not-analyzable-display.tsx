import React from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NotAnalyzableDisplayProps {
  message: string;           // 来自AI的提示信息
  onRetry: () => void;       // 重新分析当前照片
  onUploadNew: () => void;   // 上传新照片
}

/**
 * 当照片无法分析时显示的友好界面组件
 * 提供拍照建议和操作按钮
 */
export function NotAnalyzableDisplay({ message, onRetry, onUploadNew }: NotAnalyzableDisplayProps) {
  const t = useTranslations('facerate.notAnalyzable');
  
  return (
    <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center">
      {/* 图标 */}
      <div className="mb-6">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <Camera className="w-10 h-10 text-orange-500" />
        </div>
      </div>
      
      {/* 主要提示信息 */}
      <h3 className="text-xl font-bold text-card-foreground mb-4">
        {t('title')}
      </h3>
      
      {/* AI返回的具体信息 */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {message}
      </p>
      
      {/* 拍照建议 */}
      <div className="bg-muted rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-foreground mb-2">{t('tips.title')}</h4>
        <ul className="text-sm text-muted-foreground space-y-1 text-left">
          <li>• {t('tips.items.0')}</li>
          <li>• {t('tips.items.1')}</li>
          <li>• {t('tips.items.2')}</li>
          <li>• {t('tips.items.3')}</li>
          <li>• {t('tips.items.4')}</li>
        </ul>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 重新分析按钮 */}
        <button
          onClick={onRetry}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t('actions.retry')}
        </button>
        
        {/* 上传新照片按钮 */}
        <button
          onClick={onUploadNew}
          className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {t('actions.uploadNew')}
        </button>
      </div>
      
      {/* 底部提示 */}
      <p className="text-xs text-gray-500 mt-4">
        {t('description')}
      </p>
    </div>
  );
}

export default NotAnalyzableDisplay;