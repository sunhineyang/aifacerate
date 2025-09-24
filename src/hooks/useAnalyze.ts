import { useState } from 'react';

// 定义分析结果的数据类型
export interface AnalysisResult {
  analyzable: boolean;  // 是否可以分析
  message?: string;     // 提示信息（当不可分析时）
  score: number;        // 评分 (0-100)
  stars: number;        // 星级 (1-5)
  age: number;          // 预测年龄
  celebrity: {          // 明星相似度
    name: string;
    country: string;
  };
  comment: string;      // 金句评语
  features: {           // 面部特征描述
    eyes: string;
    nose: string;
    smile: string;
    face: string;
  };
}

// 定义Hook的返回类型
interface UseAnalyzeReturn {
  analyze: (photo: string, lang?: string) => Promise<AnalysisResult | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * 用于管理人脸分析API调用的Hook
 * @returns {UseAnalyzeReturn} 包含analyze函数、loading状态和error信息
 */
export function useAnalyze(): UseAnalyzeReturn {
  // 加载状态：当API调用进行中时为true
  const [loading, setLoading] = useState(false);
  // 错误信息：当API调用失败时存储错误消息
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 清除错误信息
   */
  const clearError = () => {
    setError(null);
  };
  
  /**
   * 分析人脸照片
   * @param photo - base64编码的图片数据
   * @param lang - 语言代码，默认为'en'
   * @returns Promise<AnalysisResult | null> - 分析结果或null（失败时）
   */
  const analyze = async (photo: string, lang: string = 'en'): Promise<AnalysisResult | null> => {
    // 开始分析，设置加载状态
    setLoading(true);
    setError(null);
    
    try {
      console.log('开始人脸分析...', {
        timestamp: new Date().toISOString(),
        lang,
        photoSize: photo.length
      });
      
      // 调用我们创建的API接口
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photo, lang })
      });
      
      // 解析响应数据
      const responseData = await response.json();
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP错误: ${response.status}`);
      }
      
      // 解析分析结果（包括可分析和不可分析的情况）
      const result: AnalysisResult = responseData;
      
      // 如果不可分析，也返回结果，让前端组件处理显示
      if (result.analyzable === false) {
        console.log('图片不可分析:', {
          timestamp: new Date().toISOString(),
          message: result.message
        });
        return result; // 返回包含analyzable: false的结果
      }
      
      console.log('人脸分析完成:', {
        timestamp: new Date().toISOString(),
        score: result.score,
        stars: result.stars,
        age: result.age
      });
      
      return result;
      
    } catch (err) {
      // 处理各种错误情况
      let errorMessage = '分析失败，请稍后重试';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('人脸分析错误:', {
        timestamp: new Date().toISOString(),
        error: errorMessage,
        originalError: err
      });
      
      setError(errorMessage);
      return null;
      
    } finally {
      // 无论成功还是失败，都要结束加载状态
      setLoading(false);
    }
  };
  
  return {
    analyze,
    loading,
    error,
    clearError
  };
}

/**
 * 将文件转换为base64格式
 * @param file - 要转换的文件
 * @returns Promise<string> - base64编码的字符串
 */
export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // 移除data:image/...;base64,前缀，只保留base64数据
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('文件读取失败'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取出错'));
    };
    
    // 读取文件为data URL格式
    reader.readAsDataURL(file);
  });
}

/**
 * 验证图片文件是否符合要求
 * @param file - 要验证的文件
 * @returns {isValid: boolean, error?: string} - 验证结果
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '请上传 JPG、PNG 或 WebP 格式的图片'
    };
  }
  
  // 检查文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '图片大小不能超过10MB'
    };
  }
  
  return { isValid: true };
}