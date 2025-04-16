import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieSlider from '../../components/MovieSlider/MovieSlider';
import Footer from '../../components/Footer/Footer';
import './HomePage.css';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import Header from '../../components/Header/Header';

const HomePage = () => {
  const navigate = useNavigate();

  const [trendingContent, setTrendingContent] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);

        const responses = await Promise.all([
          fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`)
        ]);

        const [
          trendingData,
          newReleasesData,
          topRatedData,
          popularShowsData,
          comedyData
        ] = await Promise.all(responses.map(res => res.json()));

        const formatMovieData = (movies) => {
          return movies.map(movie => {
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

  const getGenres = (genreIds) => {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };

    return genreIds
      .slice(0, 3)
      .map(id => genreMap[id] || '')
      .filter(Boolean)
      .join(' • ');
  };

  const playMovie = async (movie) => {
    try {
      const res = await fetch(`${BASE_URL}/${movie.mediaType}/${movie.id}/videos?api_key=${API_KEY}`);
      const data = await res.json();
      const trailer = data.results.find(
        video => video.type === 'Trailer' || video.type === 'Teaser'
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setIsModalOpen(true);
      } else {
        alert('No trailer available for this title');
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
      alert('Could not play trailer at this time');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrailerKey(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      const formattedResults = data.results.slice(0, 6).map(result => ({
        id: result.id,
        title: result.title || result.name,
        image: result.poster_path ? `${IMAGE_BASE_URL}${result.poster_path}` : "/assets/images/placeholder.jpg",
        duration: result.media_type === 'movie' ? 'Movie' : 'TV Series',
        genres: getGenres(result.genre_ids || []),
        mediaType: result.media_type
      }));

      setSearchResults(formattedResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  return (
    <div className="home-page">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
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
                backgroundImage: featuredMovie.backdropPath
                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${featuredMovie.backdropPath})`
                  : null
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

          <MovieSlider title="Trending Now" movies={trendingContent} onPlayMovie={playMovie} />
          <MovieSlider title="New Releases" movies={newReleases} onPlayMovie={playMovie} />
          <MovieSlider title="Top Rated TV Shows" movies={topRatedShows} onPlayMovie={playMovie} />
          <MovieSlider title="Popular Shows" movies={popularShows} onPlayMovie={playMovie} />
          <MovieSlider title="Comedy Movies" movies={comedyMovies} onPlayMovie={playMovie} />

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

export default HomePage;
