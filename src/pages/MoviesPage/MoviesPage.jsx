import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import './MoviesPage.css';
import Header from '../../components/Header/Header';
import { useMedia } from '../../context/MediaContext';

const MoviesPage = () => {
  const navigate = useNavigate();
  
  const { 
    isLoading, setIsLoading, 
    trailerKey, isModalOpen,
    searchQuery, searchResults, showSearchResults,
    playMedia, closeModal, handleSearchInputChange, 
    fetchMovies
  } = useMedia();
  
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        
        const popular = await fetchMovies('/movie/popular?');
        const action = await fetchMovies('/discover/movie?with_genres=28');
        const comedy = await fetchMovies('/discover/movie?with_genres=35');
        const drama = await fetchMovies('/discover/movie?with_genres=18');
        const horror = await fetchMovies('/discover/movie?with_genres=27');
        
        setPopularMovies(popular);
        setActionMovies(action);
        setComedyMovies(comedy);
        setDramaMovies(drama);
        setHorrorMovies(horror);
        
        if (popular.length > 0) {
          setFeaturedMovie(popular[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="movies-page min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onSearchSubmit={handleSearch}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        playShow={playMedia}
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
                <h2 style={{color:"white",backgroundColor:"rgb(146, 17, 155",padding:"3px 5px",width:"188px",borderRadius:"7px",fontWeight:"bold"}}>Featured Movie</h2>
                <h1>{featuredMovie.title}</h1>
                <p>{featuredMovie.genres}</p>
                <p>{featuredMovie.overview}</p>
                <div className="buttons">
                  <button onClick={() => playMedia(featuredMovie)} className="play-btn">▶ Play</button>
                  <button className="info-btn">ℹ More Info</button>
                </div>
              </div>
            </div>
          )}

          <MovieSlider title="Popular Movies" movies={popularMovies} onPlayMovie={playMedia} />
          <MovieSlider title="Action Movies" movies={actionMovies} onPlayMovie={playMedia} />
          <MovieSlider title="Comedy Movies" movies={comedyMovies} onPlayMovie={playMedia} />
          <MovieSlider title="Drama Movies" movies={dramaMovies} onPlayMovie={playMedia} />
          <MovieSlider title="Horror Movies" movies={horrorMovies} onPlayMovie={playMedia} />

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