import React, { useState } from 'react';
import './Select.css';

const Select = ({ 
  options, 
  placeholder = 'Select an option', 
  onChange, 
  value, 
  multiple = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(multiple ? (value || []) : (value ? [value] : []));
  
  const handleOptionClick = (option) => {
    let newSelectedOptions;
    
    if (multiple) {
      if (selectedOptions.includes(option.value)) {
        newSelectedOptions = selectedOptions.filter(item => item !== option.value);
      } else {
        newSelectedOptions = [...selectedOptions, option.value];
      }
    } else {
      newSelectedOptions = [option.value];
      setIsOpen(false);
    }
    
    setSelectedOptions(newSelectedOptions);
    
    if (onChange) {
      onChange(multiple ? newSelectedOptions : option.value);
    }
  };
  
  const displayValue = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    
    if (multiple) {
      return `${selectedOptions.length} option${selectedOptions.length !== 1 ? 's' : ''} selected`;
    }
    
    const selectedOption = options.find(option => option.value === selectedOptions[0]);
    return selectedOption ? selectedOption.label : placeholder;
  };
  
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`custom-select ${disabled ? 'disabled' : ''}`}>
      <div 
        className={`select-header ${isOpen ? 'open' : ''}`} 
        onClick={toggleDropdown}
      >
        <div className="select-value">{displayValue()}</div>
        <div className="select-arrow">▼</div>
      </div>
      
      {isOpen && (
        <div className="select-options">
          {options.map((option) => (
            <div 
              key={option.value}
              className={`select-option ${selectedOptions.includes(option.value) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {multiple && (
                <span className="checkbox">
                  {selectedOptions.includes(option.value) && '✓'}
                </span>
              )}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
