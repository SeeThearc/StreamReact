import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  const fontSize = size === 'large' ? '40px' : size === 'medium' ? '32px' : '24px';
  
  return (
    <div className="logo">
      <p style={{ color: "rgb(146, 17, 155)", fontSize }}>Stream</p>
      <p style={{ color: "#fff", fontSize }}>Sphere.</p>
    </div>
  );
};

export default Logo;
