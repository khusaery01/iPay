import React from 'react';

interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  isOutlined?: boolean;
  icon?: React.ReactNode;
  color?: string; // Hex or CSS color
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  isLoading = false,
  isOutlined = false,
  icon,
  color,
  type = 'button',
  disabled = false,
  style = {},
  className = '',
}) => {
  const primaryColor = color || '#4F46E5';

  if (isOutlined) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`custom-btn custom-btn-outlined ${className}`}
        style={{
          width: '100%',
          minHeight: '48px',
          padding: '12px 16px',
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `1.5px solid ${primaryColor}`,
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.15s ease',
          ...style,
        }}
      >
        {isLoading ? (
          <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: primaryColor }} />
        ) : (
          <>
            {icon}
            <span>{text}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`custom-btn custom-btn-elevated ${className}`}
      style={{
        width: '100%',
        minHeight: '48px',
        padding: '12px 16px',
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: disabled ? 'none' : '0 2px 6px rgba(79, 70, 229, 0.25)',
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {isLoading ? (
        <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#FFFFFF' }} />
      ) : (
        <>
          {icon}
          <span>{text}</span>
        </>
      )}
    </button>
  );
};
