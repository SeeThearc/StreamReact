import React, { useRef } from 'react';
import MovieCard from '../MovieCard/MovieCard';
import './MovieSlider.css';

const MovieSlider = ({ title, movies, onPlayMovie }) => {
  const sliderContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (sliderContainerRef.current) {
      sliderContainerRef.current.scrollBy({
        left: direction * 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="slider-section">
      <h3 className="slider-title">{title}</h3>
      <div className="slider-navigation">
        <button className="arrow left" onClick={() => handleScroll(-1)}>❮</button>
        <div className="slider-container" ref={sliderContainerRef}>
          {movies.map((movie, index) => (
            <div className="slider-item" key={index} onClick={() => onPlayMovie(movie)}>
              <MovieCard 
                image={movie.image} 
                title={movie.title} 
                rating={movie.rating} 
                duration={movie.duration} 
                genres={movie.genres}
                movie={movie}
              />
            </div>
          ))}
        </div>
        <button className="arrow right" onClick={() => handleScroll(1)}>❯</button>
      </div>
    </section>
  );
};

export default MovieSlider;