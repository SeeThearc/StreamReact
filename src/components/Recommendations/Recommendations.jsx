import React from 'react';
import MovieSlider from '../MovieSlider/MovieSlider';
import './Recommendations.css'; 

const Recommendations = ({ recommendations, isLoading, onPlayMedia, onAddToMyList }) => {
  if (isLoading) {
    return (
      <div className="recommendations-section">
        <h2>Getting Recommendations For You...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <p>We're preparing personalized recommendations based on your list.</p>
        <p>Try adding more variety to your list for better recommendations!</p>
      </div>
    );
  }

  const formattedRecommendations = recommendations.map(item => ({
    ...item,
    duration: item.year,
    genres: `${item.mediaType === 'movie' ? 'Movie' : 'TV Show'} • ${item.reason.substring(0, 60)}${item.reason.length > 60 ? '...' : ''}`
  }));

  return (
    <MovieSlider 
      title="Recommended For You" 
      movies={formattedRecommendations} 
      onPlayMovie={onPlayMedia} 
    />
  );
};

export default Recommendations;