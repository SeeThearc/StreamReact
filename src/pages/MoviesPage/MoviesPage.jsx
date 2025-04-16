import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './MoviesPage.css'; // You'll need to create this CSS file
import Header from '../../components/Header/Header';

const MoviesPage = () => {
  const navigate = useNavigate();
  
  // State for storing movie data
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef(null);

  // API configuration
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular movies
        const popularResponse = await fetch(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}`
        );
        const popularData = await popularResponse.json();
        
        // Fetch action movies
        const actionResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`
        );
        const actionData = await actionResponse.json();
        
        // Fetch comedy movies
        const comedyResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`
        );
        const comedyData = await comedyResponse.json();
        
        // Fetch drama movies
        const dramaResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=18`
        );
        const dramaData = await dramaResponse.json();
        
        // Fetch horror movies
        const horrorResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`
        );
        const horrorData = await horrorResponse.json();
        
        // Format the data for our components
        const formattedPopular = formatMovieData(popularData.results);
        const formattedAction = formatMovieData(actionData.results);
        const formattedComedy = formatMovieData(comedyData.results);
        const formattedDrama = formatMovieData(dramaData.results);
        const formattedHorror = formatMovieData(horrorData.results);
        
        setPopularMovies(formattedPopular);
        setActionMovies(formattedAction);
        setComedyMovies(formattedComedy);
        setDramaMovies(formattedDrama);
        setHorrorMovies(formattedHorror);
        
        // Set a featured movie for the banner
        if (formattedPopular.length > 0) {
          setFeaturedMovie(formattedPopular[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, []);

  // Effect to handle clicks outside of search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to search for movies as user types
  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`
          );
          const data = await response.json();
          const formattedResults = formatMovieData(data.results.slice(0, 5)); // Limit to 5 results
          setSearchResults(formattedResults);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Error searching movies:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchMovies();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  // Format the movie data from API to match our component structure
  const formatMovieData = (movies) => {
    return movies.map(movie => {
      return {
        id: movie.id,
        image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "/assets/images/placeholder.jpg",
        backdropPath: movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
        title: movie.title,
        rating: movie.adult ? "U/A 18+" : "U/A 13+",
        duration: "Movie",
        genres: getGenres(movie.genre_ids || []),
        overview: movie.overview,
        mediaType: 'movie'
      };
    });
  };
  
  // Convert genre IDs to text
  const getGenres = (genreIds) => {
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
    
    return genreIds
      .slice(0, 3)
      .map(id => genreMap[id] || '')
      .filter(genre => genre !== '')
      .join(' • ');
  };

  const playMovie = async (movie) => {
    try {
      const videoResponse = await fetch(
        `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoResponse.json();
      
      const trailer = videoData.results.find(
        video => video.type === 'Trailer' || video.type === 'Teaser'
      );
      
      if (trailer) {
        setTrailerKey(trailer.key);
        setIsModalOpen(true);
        setShowSearchResults(false);
        setSearchQuery('');
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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="movies-page">
      <Header
  searchQuery={searchQuery}
  onSearchChange={handleSearchInputChange}
  onSearchSubmit={handleSearch}
  searchResults={searchResults}
  showSearchResults={setShowSearchResults}
  playShow={playMovie}
  searchPlaceholder="Search movies..."
/>


      {isLoading ? (
        <div className="loading" style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
          Loading content...
        </div>
      ) : (
        <>
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
                <h2>Featured Movie</h2>
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

          <MovieSlider title="Popular Movies" movies={popularMovies} onPlayMovie={playMovie} />
          <MovieSlider title="Action Movies" movies={actionMovies} onPlayMovie={playMovie} />
          <MovieSlider title="Comedy Movies" movies={comedyMovies} onPlayMovie={playMovie} />
          <MovieSlider title="Drama Movies" movies={dramaMovies} onPlayMovie={playMovie} />
          <MovieSlider title="Horror Movies" movies={horrorMovies} onPlayMovie={playMovie} />

          <Footer />

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

export default MoviesPage;
