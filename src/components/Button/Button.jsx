import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  className = '', 
  style = {} 
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`custom-button ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
