import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './MyListPage.css';

const MyListPage = () => {
  const navigate = useNavigate();
  
  // State for storing my list data
  const [myList, setMyList] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef(null);

  // API configuration
  const API_KEY = 'd727dfd30a34d9430f9e70f7d07d6c81';
  const BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    // Load my list from localStorage
    const savedList = localStorage.getItem('myList');
    if (savedList) {
      setMyList(JSON.parse(savedList));
    }
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

  // Effect to search for content as user types
  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`
          );
          const data = await response.json();
          const formattedResults = data.results.slice(0, 5).map(item => {
            const title = item.title || item.name;
            const isMovie = item.media_type === 'movie' || item.title;
            
            return {
              id: item.id,
              image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/assets/images/placeholder.jpg",
              title: title,
              duration: isMovie ? "Movie" : "TV Series",
              genres: "",
              mediaType: item.media_type || (isMovie ? 'movie' : 'tv')
            };
          });
          
          setSearchResults(formattedResults);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Error searching content:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchContent();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, API_KEY]);

  const playContent = async (item) => {
    try {
      const videoResponse = await fetch(
        `${BASE_URL}/${item.mediaType}/${item.id}/videos?api_key=${API_KEY}`
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

  const removeFromMyList = (item) => {
    const updatedList = myList.filter(
      listItem => !(listItem.id === item.id && listItem.mediaType === item.mediaType)
    );
    setMyList(updatedList);
    localStorage.setItem('myList', JSON.stringify(updatedList));
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
    <div className="mylist-page">
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
            <Link to="/mylist" className="head-opt active">My List</Link>
          </div>
        </div>
        <div className="head-right">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search content..."
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
                {searchResults.map((item) => (
                  <div 
                    key={`${item.mediaType}-${item.id}`} 
                    className="search-result-item"
                    onClick={() => playContent(item)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="search-result-image" 
                    />
                    <div className="search-result-info">
                      <h4>{item.title}</h4>
                      <p>{item.duration} • {item.genres}</p>
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

      <div className="mylist-content">
        <h1>My List</h1>
        
        {myList.length === 0 ? (
          <div className="empty-list">
            <p>Your list is empty. Add movies and shows by clicking the + icon when browsing content.</p>
          </div>
        ) : (
          <div className="mylist-grid">
            {myList.map((item) => (
              <div key={`${item.mediaType}-${item.id}`} className="mylist-item">
                <div className="mylist-poster">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    onClick={() => playContent(item)}
                  />
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromMyList(item)}
                    title="Remove from My List"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                </div>
                <div className="mylist-info">
                  <h3>{item.title}</h3>
                  <p>{item.duration} • {item.genres}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <TrailerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        trailerKey={trailerKey}
      />
    </div>
  );
};

export default MyListPage;
