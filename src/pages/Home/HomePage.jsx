import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import './HomePage.css';
import TrailerModal from '../../components/TrailerModal/TrailerModal';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State for storing movie data
  const [trendingContent, setTrendingContent] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // API configuration
  const API_KEY = 'd727dfd30a34d9430f9e70f7d07d6c81'; // Replace with your actual API key
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending movies and shows
        const trendingResponse = await fetch(
          `${BASE_URL}/trending/all/week?api_key=${API_KEY}`
        );
        const trendingData = await trendingResponse.json();
        
        // Fetch new releases (now playing movies)
        const newReleasesResponse = await fetch(
          `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`
        );
        const newReleasesData = await newReleasesResponse.json();
        
        // Fetch top rated TV shows
        const topRatedResponse = await fetch(
          `${BASE_URL}/tv/top_rated?api_key=${API_KEY}`
        );
        const topRatedData = await topRatedResponse.json();
        
        // Fetch popular TV shows
        const popularShowsResponse = await fetch(
          `${BASE_URL}/tv/popular?api_key=${API_KEY}`
        );
        const popularShowsData = await popularShowsResponse.json();
        
        // Fetch comedy movies
        const comedyResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`
        );
        const comedyData = await comedyResponse.json();
        
        // Format the data for our components
        const formattedTrending = formatMovieData(trendingData.results);
        const formattedNewReleases = formatMovieData(newReleasesData.results);
        const formattedTopRated = formatMovieData(topRatedData.results);
        const formattedPopularShows = formatMovieData(popularShowsData.results);
        const formattedComedyMovies = formatMovieData(comedyData.results);
        
        setTrendingContent(formattedTrending);
        setNewReleases(formattedNewReleases);
        setTopRatedShows(formattedTopRated);
        setPopularShows(formattedPopularShows);
        setComedyMovies(formattedComedyMovies);
        
        // Set a featured movie for the banner (first trending item)
        if (formattedTrending.length > 0) {
          setFeaturedMovie(formattedTrending[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [API_KEY]);
  
  // Format the movie data from API to match our component structure
  const formatMovieData = (movies) => {
    return movies.map(movie => {
      // Handle both movies and TV shows
      const title = movie.title || movie.name;
      const isMovie = movie.media_type === 'movie' || movie.title;
      
      return {
        id: movie.id,
        image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "/assets/images/placeholder.jpg",
        backdropPath: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
        title: title,
        rating: movie.adult ? "U/A 18+" : "U/A 13+",
        duration: isMovie ? "Movie" : "TV Series",
        genres: getGenres(movie.genre_ids),
        overview: movie.overview,
        mediaType: movie.media_type || (isMovie ? 'movie' : 'tv')
      };
    });
  };
  
  // Convert genre IDs to text
  const getGenres = (genreIds) => {
    // Map of genre IDs to genre names (simplified version)
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };
    
    // Get up to 3 genres
    return genreIds
      .slice(0, 3)
      .map(id => genreMap[id] || '')
      .filter(genre => genre !== '')
      .join(' • ');
  };

  const playMovie = async (movie) => {
    try {
      // Fetch the movie videos (trailers)
      const videoResponse = await fetch(
        `${BASE_URL}/${movie.mediaType}/${movie.id}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoResponse.json();
      
      // Find a trailer or teaser
      const trailer = videoData.results.find(
        video => video.type === 'Trailer' || video.type === 'Teaser'
      );
      
      if (trailer) {
        // Set the trailer key for the modal
        setTrailerKey(trailer.key);
        setIsModalOpen(true);
      } else {
        console.log('No trailer available for this title');
        alert('No trailer available for this title');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      alert('Could not play trailer at this time');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrailerKey(null);
  };

  const redirectToSignOut = () => {
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to a search results page with the query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="home-page">
      <div className="header">
        <div className="head-left">
          <div className="logo">
            <p style={{ color: "rgb(146, 17, 155)" }}>Stream</p>
            <p style={{ color: "#fff" }}>Sphere.</p>
          </div>
          <div className="head-options">
            <Link to="/home" className="head-opt">Home</Link>
            <Link to="/movies" className="head-opt">Movies</Link>
            <Link to="/webseries" className="head-opt">Web Series</Link>
            <Link to="/mylist" className="head-opt">My List</Link>
          </div>
        </div>
        <div className="head-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fa-solid fa-magnifying-glass" style={{ color: "white" }}></i>
            </button>
          </form>
          <i className="fa-solid fa-bell head-logo" style={{ color: "white" }}></i>
          <img src="/assets/images/profile.png" alt="profile" height="40px" className="pro" />
          <i className="fa-solid fa-caret-down head-logo" style={{ color: "white" }}></i>
          <i 
            className="fa-solid fa-right-from-bracket" 
            style={{ color: "blueviolet", cursor: "pointer", marginRight: "10px" }} 
            onClick={redirectToSignOut}
          ></i>
        </div>
      </div>

      {isLoading ? (
        <div className="loading" style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
          Loading content...
        </div>
      ) : (
        <>
          {/* Dynamic Banner based on featured movie */}
          {featuredMovie && (
            <div 
              className="banner" 
              style={{
                backgroundImage: featuredMovie.backdropPath ? 
                  `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${featuredMovie.backdropPath})` : 
                  null
              }}
            >
              <div className="banner-content">
                <h2>{featuredMovie.mediaType === 'movie' ? 'Featured Movie' : 'Featured Show'}</h2>
                <h1>{featuredMovie.title}</h1>
                <p>{featuredMovie.genres}</p>
                <p>{featuredMovie.overview}</p>
                <div className="buttons">
                  <button onClick={() => playMovie(featuredMovie)} className="play-btn">▶ Play</button>
                  <button className="info-btn">ℹ More Info</button>
                </div>
              </div>
            </div>
          )}

          {/* Movie sliders with dynamic content */}
          <MovieSlider title="Trending Now" movies={trendingContent} onPlayMovie={playMovie} />
          <MovieSlider title="New Releases" movies={newReleases} onPlayMovie={playMovie} />
          <MovieSlider title="Top Rated TV Shows" movies={topRatedShows} onPlayMovie={playMovie} />
          <MovieSlider title="Popular Shows" movies={popularShows} onPlayMovie={playMovie} />
          <MovieSlider title="Comedy Movies" movies={comedyMovies} onPlayMovie={playMovie} />

          <Footer />

          {/* Add the TrailerModal component */}
          <TrailerModal
            isOpen={isModalOpen}
            onClose={closeModal}
            trailerKey={trailerKey}
          />
        </>
      )}
    </div>
  );
};

export default HomePage;
