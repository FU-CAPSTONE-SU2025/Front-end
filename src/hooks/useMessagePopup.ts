import { notification } from 'antd';

export const useMessagePopup = () => {
  const showSuccess = (description: string, message: string = 'Success') => {
    notification.success({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  const showError = (description: string, message: string = 'Error') => {
    notification.error({
      message,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  const showInfo = (description: string, message: string = 'Information') => {
    notification.info({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  const showWarning = (description: string, message: string = 'Warning') => {
    notification.warning({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}; 