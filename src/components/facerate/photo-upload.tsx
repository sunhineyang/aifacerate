'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface PhotoUploadProps {
  onUpload: (file: File) => void;
  pageData?: any;
}

export function PhotoUpload({ onUpload, pageData }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 验证文件
  const validateFile = (file: File): string | null => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return pageData?.errors?.invalidFile || 'Please upload a valid image file (JPG, PNG, GIF formats)';
    }

    // 检查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return pageData?.errors?.fileTooLarge || 'Image file size cannot exceed 10MB';
    }

    return null;
  };

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    // 模拟上传延迟
    setTimeout(() => {
      setIsUploading(false);
      onUpload(file);
    }, 500);
  }, [onUpload]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="p-8 md:p-12">
      {/* 上传区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging 
            ? 'border-primary/50 bg-accent' 
            : 'border-border hover:border-border/80 hover:bg-accent/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {/* 上传图标 */}
        <div className="mb-6">
          {isUploading ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <ImageIcon className={`w-8 h-8 ${
                isDragging ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
          )}
        </div>

        {/* 上传文本 */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {isUploading ? (pageData?.upload?.uploading || 'Uploading...') : (pageData?.upload?.title || 'Upload Your Photo')}
          </h3>
          <p className="text-muted-foreground">
            {isDragging 
              ? (pageData?.upload?.dragActive || 'Release to upload')
              : (pageData?.upload?.dragText || 'Drag and drop your photo here, or click to select')
            }
          </p>
        </div>

        {/* 上传按钮 */}
        {!isUploading && (
          <div className="mb-6">
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-input')?.click();
              }}
            >
              <Upload className="w-5 h-5 mr-2" />
              {pageData?.upload?.selectButton || '选择照片'}
            </button>
          </div>
        )}

        {/* 文件输入 */}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 文件要求说明 */}
        <div className="text-sm text-muted-foreground">
          <p>{pageData?.upload?.supportedFormats || '支持 JPG、PNG、GIF 等格式'}</p>
          <p>{pageData?.upload?.maxSize || '文件大小不超过 10MB'}</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-destructive font-medium mb-1">{pageData?.upload?.uploadFailed || 'Upload Failed'}</h4>
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-muted border border-border rounded-lg p-6">
        <h4 className="text-foreground font-medium mb-2">{pageData?.upload?.tips?.title || 'Usage Tips'}</h4>
        <ul className="text-muted-foreground text-sm space-y-1">
          <li>• {pageData?.upload?.tips?.clearPhoto || 'Please upload a clear front-facing photo with a fully visible face'}</li>
          <li>• {pageData?.upload?.tips?.noFilters || 'Avoid using heavily beautified or filtered photos'}</li>
          <li>• {pageData?.upload?.tips?.goodLighting || 'Well-lit photos provide more accurate analysis results'}</li>
          <li>• {pageData?.upload?.privacy || 'Your photo will not be saved or shared without your consent'}</li>
        </ul>
      </div>
    </div>
  );
}