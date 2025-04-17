import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import Header from '../../components/Header/Header';
import Recommendations from '../../components/Recommendations/Recommendations';
import { useMedia } from '../../context/MediaContext';
import './MyListPage.css';

const MyListPage = () => {
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  
  const {
    myList,
    removeFromMyList,
    addToMyList,
    trailerKey,
    isModalOpen,
    closeModal,
    playMedia,
    searchQuery,
    handleSearchInputChange,
    searchResults,
    showSearchResults,
    setShowSearchResults,
    recommendations,
    isLoadingRecommendations,
    fetchRecommendations
  } = useMedia();

  useEffect(() => {
    if (myList.length > 0) {
      console.log("MyListPage mounted, fetching recommendations");
      fetchRecommendations();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToList = (item) => {
    const formattedItem = {
      ...item,
      genres: item.genres || `${item.mediaType === 'movie' ? 'Movie' : 'TV Show'} (${item.year})`,
      duration: item.year
    };
    
    addToMyList(formattedItem);
  };

  return (
    <div className="mylist-page min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearch}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
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
        
        {myList.length > 0 && (
          <Recommendations 
            recommendations={recommendations}
            isLoading={isLoadingRecommendations}
            onPlayMedia={playMedia}
            onAddToMyList={handleAddToList}
          />
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