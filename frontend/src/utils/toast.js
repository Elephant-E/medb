/**
 * Toast 提示工具 - 基于 shadcn/ui
 */

import { toast as showToast } from '@/components/ui/toast/use-toast';

export default {
  success: (message, duration) => {
    showToast({
      description: message,
      variant: 'default',
      duration: duration || 3000,
    });
  },
  error: (message, duration) => {
    showToast({
      title: '错误',
      description: message,
      variant: 'destructive',
      duration: duration || 3000,
    });
  },
  info: (message, duration) => {
    showToast({
      description: message,
      variant: 'default',
      duration: duration || 3000,
    });
  },
  warning: (message, duration) => {
    showToast({
      title: '警告',
      description: message,
      variant: 'default',
      duration: duration || 3000,
    });
  },
};
