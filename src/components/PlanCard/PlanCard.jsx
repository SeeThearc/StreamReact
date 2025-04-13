import React from 'react';
import './PlanCard.css';

const PlanCard = ({ title, price, features, isPopular, onSelect }) => {
  return (
    <div className={`plan ${isPopular ? 'popular' : ''}`}>
      <h2>{title}</h2>
      <p className="price">{price}/month</p>
      <ul>
        {features.map((feature, index) => (
          <li key={index}>✔ {feature}</li>
        ))}
      </ul>
      <button onClick={onSelect}>Select Plan</button>
    </div>
  );
};

export default PlanCard;
