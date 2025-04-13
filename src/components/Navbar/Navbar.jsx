import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../Logo/Logo';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSignUpPage = location.pathname === '/signup' || location.pathname === '/plans' || location.pathname === '/success';
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <Logo size="large" />
      
      {isSignUpPage ? (
        <Link to="/">
          <button style={{ width: "100px", marginTop: 0 }}>Sign Out</button>
        </Link>
      ) : (
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-items">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link">Services</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">Contact</Link>
            </li>
            <li className="nav-item">
              <Link to="/blog" className="nav-link">Blog</Link>
            </li>
          </ul>
          <div className="nav-icon" onClick={toggleMenu}>
            <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
