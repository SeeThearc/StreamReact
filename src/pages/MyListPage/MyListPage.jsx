import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import Header from '../../components/Header/Header';
import { useMedia } from '../../context/MediaContext';
import './MyListPage.css';

const MyListPage = () => {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  
  // Get all needed context values
  const {
    myList,
    removeFromMyList,
    trailerKey,
    isModalOpen,
    closeModal,
    playMedia,
    searchQuery,
    handleSearchInputChange,
    searchResults,
    showSearchResults,
    setShowSearchResults
  } = useMedia();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const redirectToSignOut = () => {
    navigate('/');
  };

  return (
    <div className="mylist-page">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearch}
        searchResults={searchResults}
        showSearchResults={setShowSearchResults}
        playShow={playMedia}
        searchPlaceholder="Search content..."
      />

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
                    onClick={() => playMedia(item)}
                  />
                  <button 
                    className="remove-btn"
                    onClick={(e) => removeFromMyList(item, e)}
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