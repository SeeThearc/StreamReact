import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './WebSeriesPage.css'; // You'll need to create this CSS file

const WebSeriesPage = () => {
  const navigate = useNavigate();
  
  // State for storing TV show data
  const [popularShows, setPopularShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [dramaShows, setDramaShows] = useState([]);
  const [crimeShows, setCrimeShows] = useState([]);
  const [sciFiShows, setSciFiShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredShow, setFeaturedShow] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef(null);

  // API configuration
  const API_KEY = 'd727dfd30a34d9430f9e70f7d07d6c81';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular TV shows
        const popularResponse = await fetch(
          `${BASE_URL}/tv/popular?api_key=${API_KEY}`
        );
        const popularData = await popularResponse.json();
        
        // Fetch top rated TV shows
        const topRatedResponse = await fetch(
          `${BASE_URL}/tv/top_rated?api_key=${API_KEY}`
        );
        const topRatedData = await topRatedResponse.json();
        
        // Fetch drama TV shows
        const dramaResponse = await fetch(
          `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=18`
        );
        const dramaData = await dramaResponse.json();
        
        // Fetch crime TV shows
        const crimeResponse = await fetch(
          `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=80`
        );
        const crimeData = await crimeResponse.json();
        
        // Fetch sci-fi TV shows
        const sciFiResponse = await fetch(
          `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`
        );
        const sciFiData = await sciFiResponse.json();
        
        // Format the data for our components
        const formattedPopular = formatTVData(popularData.results);
        const formattedTopRated = formatTVData(topRatedData.results);
        const formattedDrama = formatTVData(dramaData.results);
        const formattedCrime = formatTVData(crimeData.results);
        const formattedSciFi = formatTVData(sciFiData.results);
        
        setPopularShows(formattedPopular);
        setTopRatedShows(formattedTopRated);
        setDramaShows(formattedDrama);
        setCrimeShows(formattedCrime);
        setSciFiShows(formattedSciFi);
        
        // Set a featured show for the banner
        if (formattedPopular.length > 0) {
          setFeaturedShow(formattedPopular[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching TV data:', error);
        setIsLoading(false);
      }
    };
    
    fetchTVData();
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

  // Effect to search for TV shows as user types
  useEffect(() => {
    const searchTVShows = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`
          );
          const data = await response.json();
          const formattedResults = formatTVData(data.results.slice(0, 5)); // Limit to 5 results
          setSearchResults(formattedResults);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Error searching TV shows:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(() => {
        searchTVShows();
      }, 500);
  
      return () => clearTimeout(debounceTimer);
    }, [searchQuery]);
    
    // Format the TV show data from API to match our component structure
    const formatTVData = (shows) => {
      return shows.map(show => {
        return {
          id: show.id,
          image: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : "/assets/images/placeholder.jpg",
          backdropPath: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
          title: show.name,
          rating: show.adult ? "U/A 18+" : "U/A 13+",
          duration: "TV Series",
          genres: getGenres(show.genre_ids || []),
          overview: show.overview,
          mediaType: 'tv'
        };
      });
    };
    
    // Convert genre IDs to text
    const getGenres = (genreIds) => {
      const genreMap = {
        10759: 'Action & Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        10762: 'Kids',
        9648: 'Mystery',
        10763: 'News',
        10764: 'Reality',
        10765: 'Sci-Fi & Fantasy',
        10766: 'Soap',
        10767: 'Talk',
        10768: 'War & Politics',
        37: 'Western'
      };
      
      return genreIds
        .slice(0, 3)
        .map(id => genreMap[id] || '')
        .filter(genre => genre !== '')
        .join(' • ');
    };
  
    const playShow = async (show) => {
      try {
        const videoResponse = await fetch(
          `${BASE_URL}/tv/${show.id}/videos?api_key=${API_KEY}`
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
      <div className="webseries-page">
        <div className="header">
          <div className="head-left">
            <div className="logo">
              <p style={{ color: "rgb(146, 17, 155)" }}>Stream</p>
              <p style={{ color: "#fff" }}>Sphere.</p>
            </div>
            <div className="head-options">
              <Link to="/home" className="head-opt">Home</Link>
              <Link to="/movies" className="head-opt">Movies</Link>
              <Link to="/webseries" className="head-opt active">Web Series</Link>
              <Link to="/mylist" className="head-opt">My List</Link>
            </div>
          </div>
          <div className="head-right">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search TV shows..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <i className="fa-solid fa-magnifying-glass" style={{ color: "white" }}></i>
                </button>
              </form>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results" ref={searchResultsRef}>
                  {searchResults.map((show) => (
                    <div 
                      key={`${show.mediaType}-${show.id}`} 
                      className="search-result-item"
                      onClick={() => playShow(show)}
                    >
                      <img 
                        src={show.image} 
                        alt={show.title} 
                        className="search-result-image" 
                      />
                      <div className="search-result-info">
                        <h4>{show.title}</h4>
                        <p>{show.duration} • {show.genres}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
            {featuredShow && (
              <div 
                className="banner" 
                style={{
                  backgroundImage: featuredShow.backdropPath ? 
                    `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${featuredShow.backdropPath})` : 
                    null
                }}
              >
                <div className="banner-content">
                  <h2>Featured Series</h2>
                  <h1>{featuredShow.title}</h1>
                  <p>{featuredShow.genres}</p>
                  <p>{featuredShow.overview}</p>
                  <div className="buttons">
                    <button onClick={() => playShow(featuredShow)} className="play-btn">▶ Play</button>
                    <button className="info-btn">ℹ More Info</button>
                  </div>
                </div>
              </div>
            )}
  
            <MovieSlider title="Popular Series" movies={popularShows} onPlayMovie={playShow} />
            <MovieSlider title="Top Rated Series" movies={topRatedShows} onPlayMovie={playShow} />
            <MovieSlider title="Drama Series" movies={dramaShows} onPlayMovie={playShow} />
            <MovieSlider title="Crime Series" movies={crimeShows} onPlayMovie={playShow} />
            <MovieSlider title="Sci-Fi & Fantasy" movies={sciFiShows} onPlayMovie={playShow} />
  
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
  
  export default WebSeriesPage;
  