import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import PlanCard from '../../components/PlanCard/PlanCard';
import Footer from '../../components/Footer/Footer';
import './PlansPage.css';

const PlansPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      title: "Basic",
      price: "$8.99",
      features: [
        "720p Resolution",
        "Good Video and sound quality",
        "Watch on any device",
        "Cancel anytime"
      ]
    },
    {
      title: "Standard",
      price: "$13.99",
      features: [
        "1080p Full HD",
        "Great Video and sound quality",
        "Watch on 2 devices",
        "Cancel anytime"
      ],
      isPopular: true
    },
    {
      title: "Premium",
      price: "$17.99",
      features: [
        "4K + HDR",
        "Best Video and sound quality",
        "Watch on 4 devices",
        "Download & watch offline"
      ]
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    navigate('/home');
  };

  return (
    <div className="plans-page">
      <Navbar />
      <main>
        <div className="subscription-container">
          <h1>Choose the plan that's right for you</h1>
          <p>Enjoy unlimited movies, TV shows, and more on any device.</p>
          <div className="plans">
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                title={plan.title}
                price={plan.price}
                features={plan.features}
                isPopular={plan.isPopular}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlansPage;
