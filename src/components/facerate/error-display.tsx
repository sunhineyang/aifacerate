'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, X, Wifi, Server, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server', 
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  FACE_NOT_FOUND = 'face_not_found',
  UNKNOWN = 'unknown'
}

// 错误配置
const ERROR_CONFIG = {
  [ErrorType.NETWORK]: {
    icon: Wifi,
    title: '网络连接失败',
    description: '请检查您的网络连接后重试',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  [ErrorType.SERVER]: {
    icon: Server,
    title: '服务器错误',
    description: '服务器暂时无法处理请求，请稍后重试',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [ErrorType.VALIDATION]: {
    icon: Image,
    title: '图片格式错误',
    description: '请上传清晰的人脸照片，支持JPG、PNG格式',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [ErrorType.FACE_NOT_FOUND]: {
    icon: Image,
    title: '未检测到清晰人脸',
    description: '请尝试上传光线充足、正面清晰的人脸照片',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [ErrorType.TIMEOUT]: {
    icon: RefreshCw,
    title: '请求超时',
    description: '分析时间过长，请重新尝试',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [ErrorType.UNKNOWN]: {
    icon: AlertCircle,
    title: '未知错误',
    description: '出现了意外错误，请重新尝试',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

interface ErrorDisplayProps {
  /** 错误信息 */
  error: string;
  /** 错误类型，用于显示不同的图标和样式 */
  type?: ErrorType;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 重试回调函数 */
  onRetry?: () => void;
  /** 关闭回调函数 */
  onClose?: () => void;
  /** 自定义样式类名 */
  className?: string;
  /** 显示模式：inline（内联）或 modal（弹窗） */
  mode?: 'inline' | 'modal';
}

/**
 * 根据错误信息自动判断错误类型
 */
function detectErrorType(error: string): ErrorType {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('network') || errorLower.includes('网络') || errorLower.includes('连接')) {
    return ErrorType.NETWORK;
  }
  
  if (errorLower.includes('timeout') || errorLower.includes('超时')) {
    return ErrorType.TIMEOUT;
  }
  
  if (errorLower.includes('server') || errorLower.includes('服务器') || errorLower.includes('500')) {
    return ErrorType.SERVER;
  }
  
  // 检测人脸相关错误
  if (errorLower.includes('人脸') || errorLower.includes('face') || 
      errorLower.includes('清晰') || errorLower.includes('clear') ||
      errorLower.includes('找不到') || errorLower.includes('can\'t seem to find') ||
      errorLower.includes('无法分析') || errorLower.includes('try another')) {
    return ErrorType.FACE_NOT_FOUND;
  }
  
  if (errorLower.includes('format') || errorLower.includes('格式') || errorLower.includes('图片')) {
    return ErrorType.VALIDATION;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * 错误显示组件
 * 用于显示各种类型的错误信息，支持重试和关闭功能
 */
export function ErrorDisplay({
  error,
  type,
  showRetry = true,
  showClose = false,
  onRetry,
  onClose,
  className = '',
  mode = 'inline'
}: ErrorDisplayProps) {
  // 自动检测错误类型
  const errorType = type || detectErrorType(error);
  const config = ERROR_CONFIG[errorType];
  const Icon = config.icon;
  
  const content = (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-lg p-6 
      ${mode === 'modal' ? 'max-w-md mx-auto' : 'w-full'}
      ${className}
    `}>
      {/* 关闭按钮 */}
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {/* 错误图标和标题 */}
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${config.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {config.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {error || config.description}
          </p>
          
          {/* 详细错误信息（开发模式下显示） */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                查看详细错误信息
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                {error}
              </pre>
            </details>
          )}
          
          {/* 操作按钮 */}
          <div className="flex space-x-3">
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重新尝试</span>
              </Button>
            )}
            
            {showClose && onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                关闭
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // 弹窗模式
  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative">
          {content}
        </div>
      </div>
    );
  }
  
  // 内联模式
  return content;
}

/**
 * 简化版错误组件
 * 用于快速显示错误信息，样式更简洁
 */
export function SimpleError({ 
  error, 
  onRetry,
  className = '' 
}: { 
  error: string; 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重试</span>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast 错误组件
 * 用于在页面顶部显示临时错误提示
 */
export function ErrorToast({ 
  error, 
  isVisible, 
  onClose,
  duration = 5000 
}: { 
  error: string; 
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}) {
  // 自动关闭
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}