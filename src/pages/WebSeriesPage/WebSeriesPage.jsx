import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './WebSeriesPage.css'; 
import Header from '../../components/Header/Header';

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
  const API_KEY = import.meta.env.VITE_API_KEY;
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
        <Header
  searchQuery={searchQuery}
  onSearchChange={handleSearchInputChange}
  onSearchSubmit={handleSearch}
  searchResults={searchResults}
  showSearchResults={setShowSearchResults}
  playShow={playShow}
  searchPlaceholder="Search web series..."
/>


  
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
  