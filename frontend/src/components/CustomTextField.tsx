import React from 'react';

interface CustomTextFieldProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  type?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  maxLines?: number;
  errorText?: string | null;
  helperText?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  prefixIcon,
  suffixIcon,
  type = 'text',
  name,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  maxLines = 1,
  errorText,
  helperText,
  style = {},
  inputStyle = {},
  onFocus,
  onBlur,
  autoFocus = false,
}) => {
  const isTextarea = maxLines > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '14px', ...style }}>
      {label && (
        <label
          style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '6px',
            display: 'block',
          }}
        >
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: isTextarea ? 'flex-start' : 'center',
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${errorText ? '#EF4444' : '#E2E8F0'}`,
          borderRadius: '12px',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        {prefixIcon && (
          <div
            style={{
              paddingLeft: '14px',
              paddingRight: '6px',
              paddingTop: isTextarea ? '12px' : 0,
              display: 'flex',
              alignItems: 'center',
              color: '#64748B',
              pointerEvents: 'none',
            }}
          >
            {prefixIcon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            rows={maxLines}
            autoFocus={autoFocus}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              flex: 1,
              width: '100%',
              padding: '12px 14px',
              fontSize: '14.5px',
              fontFamily: 'inherit',
              color: '#0F172A',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              ...inputStyle,
            }}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            autoFocus={autoFocus}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              flex: 1,
              width: '100%',
              padding: '13px 14px',
              fontSize: '14.5px',
              fontFamily: 'inherit',
              color: '#0F172A',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              ...inputStyle,
            }}
          />
        )}

        {suffixIcon && (
          <div
            style={{
              paddingRight: '14px',
              paddingLeft: '6px',
              display: 'flex',
              alignItems: 'center',
              color: '#64748B',
            }}
          >
            {suffixIcon}
          </div>
        )}
      </div>

      {errorText && (
        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', fontWeight: 500 }}>
          {errorText}
        </span>
      )}
      {!errorText && helperText && (
        <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
