import React from 'react';
import MovieSlider from '../MovieSlider/MovieSlider';
import './Recommendations.css'; // Optional - only if you need specific styles

const Recommendations = ({ recommendations, isLoading, onPlayMedia, onAddToMyList }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="recommendations-section">
        <h2>Getting Recommendations For You...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Handle empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <p>We're preparing personalized recommendations based on your list.</p>
        <p>Try adding more variety to your list for better recommendations!</p>
      </div>
    );
  }

  // Format recommendations to match the MovieSlider's expected movie format
  const formattedRecommendations = recommendations.map(item => ({
    ...item,
    duration: item.year, // Use year as duration
    genres: `${item.mediaType === 'movie' ? 'Movie' : 'TV Show'} • ${item.reason.substring(0, 60)}${item.reason.length > 60 ? '...' : ''}`
    // This combines the media type and reason in the genres field, with truncation
  }));

  // Use the MovieSlider component with recommendations data
  return (
    <MovieSlider 
      title="Recommended For You" 
      movies={formattedRecommendations} 
      onPlayMovie={onPlayMedia} 
    />
  );
};

export default Recommendations;