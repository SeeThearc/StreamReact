import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Logo from '../../components/Logo/Logo';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    navigate('/success');
  };

  return (
    <div className="signup-page">
      <Navbar />
      
      <main>
        <div className="container">
          <Logo />
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                name="username"
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-Enter Your Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="signup-btn">Sign Up</Button>
          </form>
        </div>
      </main>

      <Footer marginTop="145px" />
    </div>
  );
};

export default SignUp;
