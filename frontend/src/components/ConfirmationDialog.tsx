import React from 'react';
import { CustomButton } from './CustomButton';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          animation: 'scaleUpDialog 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0F172A',
            margin: '0 0 8px 0',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            margin: '0 0 24px 0',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <CustomButton
              text={cancelText}
              isOutlined
              onClick={onClose}
              disabled={isLoading}
            />
          </div>
          <div style={{ flex: 1 }}>
            <CustomButton
              text={confirmText}
              color={isDanger ? '#EF4444' : '#4F46E5'}
              onClick={onConfirm}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
