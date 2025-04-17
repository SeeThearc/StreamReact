import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
export const MediaContext = createContext();

// Create a custom hook to easily use the context
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
  // Shared state
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [myList, setMyList] = useState([]);
  
  // API configuration
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  // Load My List from localStorage on initial load
  useEffect(() => {
    const savedList = localStorage.getItem('myList');
    if (savedList) {
      setMyList(JSON.parse(savedList));
    }
  }, []);

  // Genre maps
  const movieGenreMap = {
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

  const tvGenreMap = {
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

  // Helper functions
  const getGenres = (genreIds, mediaType) => {
    const genreMap = mediaType === 'tv' ? tvGenreMap : movieGenreMap;
    return genreIds
      .slice(0, 3)
      .map(id => genreMap[id] || '')
      .filter(genre => genre !== '')
      .join(' • ');
  };

  const formatMovieData = (items, mediaType = 'movie') => {
    return items.map(item => {
      return {
        id: item.id,
        image: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "/assets/images/placeholder.jpg",
        backdropPath: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : null,
        title: mediaType === 'tv' ? item.name : item.title,
        rating: item.adult ? "U/A 18+" : "U/A 13+",
        duration: mediaType === 'tv' ? "TV Series" : "Movie",
        genres: getGenres(item.genre_ids || [], mediaType),
        overview: item.overview,
        mediaType: mediaType
      };
    });
  };

  const playMedia = async (media) => {
    try {
      const endpoint = media.mediaType === 'tv' ? 'tv' : 'movie';
      const videoResponse = await fetch(
        `${BASE_URL}/${endpoint}/${media.id}/videos?api_key=${API_KEY}`
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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Check if item is in my list
  const isInMyList = (item) => {
    return myList.some(listItem => 
      listItem.id === item.id && listItem.mediaType === item.mediaType
    );
  };

  // Add item to my list
  const addToMyList = (item, event) => {
    // Prevent triggering the parent click events (like play movie)
    if (event) {
      event.stopPropagation();
    }

    // Check if already in list
    if (!isInMyList(item)) {
      const updatedList = [...myList, item];
      setMyList(updatedList);
      localStorage.setItem('myList', JSON.stringify(updatedList));
    }
  };

  // Remove item from my list
  const removeFromMyList = (item, event) => {
    // Prevent triggering the parent click events
    if (event) {
      event.stopPropagation();
    }

    const updatedList = myList.filter(
      listItem => !(listItem.id === item.id && listItem.mediaType === item.mediaType)
    );
    setMyList(updatedList);
    localStorage.setItem('myList', JSON.stringify(updatedList));
  };

  // Search functionality
  useEffect(() => {
    const searchMedia = async (mediaType) => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `${BASE_URL}/search/${mediaType}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`
          );
          const data = await response.json();
          return formatMovieData(data.results.slice(0, 5), mediaType);
        } catch (error) {
          console.error(`Error searching ${mediaType}:`, error);
          return [];
        }
      }
      return [];
    };

    const debounceSearch = async () => {
      if (searchQuery.trim().length > 2) {
        const movieResults = await searchMedia('movie');
        const tvResults = await searchMedia('tv');
        setSearchResults([...movieResults, ...tvResults]);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      debounceSearch();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Fetch data methods
  const fetchMovies = async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
      const data = await response.json();
      return formatMovieData(data.results, 'movie');
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return [];
    }
  };

  const fetchTVShows = async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
      const data = await response.json();
      return formatMovieData(data.results, 'tv');
    } catch (error) {
      console.error('Error fetching TV data:', error);
      return [];
    }
  };

  const value = {
    // State
    trailerKey,
    isModalOpen,
    searchQuery,
    searchResults,
    showSearchResults,
    isLoading,
    myList,
    
    // API config
    API_KEY,
    BASE_URL,
    IMAGE_BASE_URL,
    BACKDROP_BASE_URL,
    
    // Functions
    setIsLoading,
    setSearchQuery,
    setShowSearchResults,
    playMedia,
    closeModal,
    handleSearchInputChange,
    fetchMovies,
    fetchTVShows,
    formatMovieData,
    isInMyList,
    addToMyList,
    removeFromMyList
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};