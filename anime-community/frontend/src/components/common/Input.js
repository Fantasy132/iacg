import React from 'react';
import './Input.css';

// 通用输入组件
const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;