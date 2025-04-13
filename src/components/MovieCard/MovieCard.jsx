import React from 'react';
import './MovieCard.css';

const MovieCard = ({ image, title, rating, duration, genres, onPlay }) => {
  return (
    <div className="movie-container">
      <img src={image} alt={title} width="200px" />
      <div className="movie-card">
        <h3>{title}</h3>
        <p>{rating} | {duration} | HD</p>
        <p>{genres}</p>
        {onPlay && (
          <button onClick={onPlay}>▶ Play</button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
