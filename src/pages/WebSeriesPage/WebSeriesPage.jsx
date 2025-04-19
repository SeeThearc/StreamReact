import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './WebSeriesPage.css'; 
import Header from '../../components/Header/Header';
import { useMedia } from '../../context/MediaContext';

const WebSeriesPage = () => {
  const navigate = useNavigate();
  
  const { 
    isLoading, setIsLoading, 
    trailerKey, isModalOpen,
    searchQuery, searchResults, showSearchResults,
    playMedia, closeModal, handleSearchInputChange, 
    fetchTVShows
  } = useMedia();
  
  const [popularShows, setPopularShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [dramaShows, setDramaShows] = useState([]);
  const [crimeShows, setCrimeShows] = useState([]);
  const [sciFiShows, setSciFiShows] = useState([]);
  const [featuredShow, setFeaturedShow] = useState(null);

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setIsLoading(true);
        
        const popular = await fetchTVShows('/tv/popular?');
        const topRated = await fetchTVShows('/tv/top_rated?');
        const drama = await fetchTVShows('/discover/tv?with_genres=18');
        const crime = await fetchTVShows('/discover/tv?with_genres=80');
        const sciFi = await fetchTVShows('/discover/tv?with_genres=10765');
        
        setPopularShows(popular);
        setTopRatedShows(topRated);
        setDramaShows(drama);
        setCrimeShows(crime);
        setSciFiShows(sciFi);

        if (popular.length > 0) {
          setFeaturedShow(popular[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching TV data:', error);
        setIsLoading(false);
      }
    };
    
    fetchTVData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="webseries-page min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearch}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        playShow={playMedia}
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
                <h2 style={{color:"white",backgroundColor:"rgb(146, 17, 155",padding:"3px 5px",width:"192px",borderRadius:"7px",fontWeight:"bold"}}>Featured Series</h2>
                <h1>{featuredShow.title}</h1>
                <p>{featuredShow.genres}</p>
                <p>{featuredShow.overview}</p>
                <div className="buttons">
                  <button onClick={() => playMedia(featuredShow)} className="play-btn">▶ Play</button>
                  <button className="info-btn">ℹ More Info</button>
                </div>
              </div>
            </div>
          )}

          <MovieSlider title="Popular Series" movies={popularShows} onPlayMovie={playMedia} />
          <MovieSlider title="Top Rated Series" movies={topRatedShows} onPlayMovie={playMedia} />
          <MovieSlider title="Drama Series" movies={dramaShows} onPlayMovie={playMedia} />
          <MovieSlider title="Crime Series" movies={crimeShows} onPlayMovie={playMedia} />
          <MovieSlider title="Sci-Fi & Fantasy" movies={sciFiShows} onPlayMovie={playMedia} />

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