import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = ({ marginTop }) => {
  return (
    <footer style={{ marginTop }}>
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>StreamSphere-Where entertainment meets innovation.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/blog">Blog</Link>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-github"></i></a>
            <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
          </div>
        </div>
        <div>
          <h3>Call Us</h3>
          <p style={{ fontSize: "16px" }}>+91-89005-60169</p>
          <p style={{ fontSize: "16px" }}>+91-73001-53188</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2025 StreamSphere. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
