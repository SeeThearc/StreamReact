import React, { useState } from 'react';
import { useMedia } from '../../context/MediaContext';
import './MovieCard.css';

const MovieCard = ({ image, title, rating, duration, genres, movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInMyList, addToMyList, removeFromMyList } = useMedia();

  const inMyList = movie ? isInMyList(movie) : false;

  const handleMyListClick = (e) => {
    if (movie) {
      if (inMyList) {
        removeFromMyList(movie, e);
      } else {
        addToMyList(movie, e);
      }
    }
  };

  return (
    <div 
      className="movie-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={image} alt={title} width="200px" />
      
      {isHovered && movie && (
        <button 
          className="mylist-button"
          onClick={handleMyListClick}
          title={inMyList ? "Remove from My List" : "Add to My List"}
        >
          <i className={`fa-solid ${inMyList ? 'fa-check' : 'fa-plus'}`}></i>
        </button>
      )}
      
      <div className="movie-card">
        <h3>{title}</h3>
        <p>{rating} | {duration} | HD</p>
        <p>{genres}</p>
      </div>
    </div>
  );
};

export default MovieCard;