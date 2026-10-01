import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, LockIcon } from './Icons';
import { CustomButton } from './CustomButton';

interface PinInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const PinInputDialog: React.FC<PinInputDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Konfirmasi PIN',
  description = 'Masukkan 6-digit PIN iPay Anda untuk melanjutkan transaksi',
  isLoading = false,
}) => {
  const [pin, setPin] = useState('');
  const [errorText, setErrorText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pin.trim();
    if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setErrorText('PIN harus berupa 6 angka');
      return;
    }
    setErrorText('');
    onSuccess(cleanPin);
  };

  const handlePinChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setPin(numeric);
    if (errorText) setErrorText('');
    if (numeric.length === 6) {
      onSuccess(numeric);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px',
          boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
          animation: 'slideUpModal 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex' }}>
              <LockIcon size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.45 }}>
          {description}
        </p>

        {/* PIN 6-Boxes Visual Representation */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '16px',
            cursor: 'text',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = pin[index];
            const isFilled = Boolean(digit);
            const isCurrent = pin.length === index;

            return (
              <div
                key={index}
                style={{
                  width: '44px',
                  height: '52px',
                  borderRadius: '12px',
                  border: `2px solid ${isCurrent ? '#4F46E5' : isFilled ? '#6366F1' : '#E2E8F0'}`,
                  backgroundColor: isFilled ? '#F8FAFC' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#0F172A',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {isFilled ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Hidden native input for mobile and accessibility */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => handlePinChange(e.target.value)}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            top: 0,
            left: 0,
          }}
        />

        {errorText && (
          <div style={{ textAlign: 'center', color: '#EF4444', fontSize: '12.5px', fontWeight: 500, marginBottom: '16px' }}>
            {errorText}
          </div>
        )}

        <div style={{ marginTop: '12px' }}>
          <CustomButton
            text="Konfirmasi PIN"
            onClick={() => handleSubmit()}
            isLoading={isLoading}
            disabled={pin.length !== 6 || isLoading}
          />
        </div>
      </div>
    </div>
  );
};
