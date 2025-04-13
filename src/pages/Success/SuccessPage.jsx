import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import './SuccessPage.css';

const SuccessPage = () => {
  const navigate = useNavigate();
  
  const handleChoosePlan = () => {
    navigate('/plans');
  };

  return (
    <div className="success-page">
      <Navbar />
      
      <main>
        <div className="subscription-container">
          <h1>Account Creation Successful!</h1>
          <p>Hola "Demo User" ! Welcome to StreamSphere.</p>
        </div>
      </main>
      
      <div className="action-container">
        <Button onClick={handleChoosePlan}>Choose Your Plan</Button>
      </div>
      
      <Footer marginTop="400px" />
    </div>
  );
};

export default SuccessPage;
