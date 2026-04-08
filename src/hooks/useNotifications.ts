// src/hooks/useNotifications.ts
// Wrapper around SweetAlert2 for consistent notification patterns.
import { useCallback } from 'react';
import Swal from 'sweetalert2';

export const useNotifications = () => {
  const showSuccess = useCallback((title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2500,
      showConfirmButton: false,
      background: '#1A1A1A',
      color: '#F5F5F5',
    });
  }, []);

  const showError = useCallback((title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      background: '#1A1A1A',
      color: '#F5F5F5',
    });
  }, []);

  const showWarning = useCallback((title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      background: '#1A1A1A',
      color: '#F5F5F5',
    });
  }, []);

  const showConfirm = useCallback((title: string, text?: string) => {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#6366F1',
      background: '#1A1A1A',
      color: '#F5F5F5',
    });
  }, []);

  return { showSuccess, showError, showWarning, showConfirm };
};
