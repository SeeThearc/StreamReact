import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieSlider from "../../components/MovieSlider/MovieSlider";
import Footer from "../../components/Footer/Footer";
import "./HomePage.css";
import TrailerModal from "../../components/TrailerModal/TrailerModal";
import Header from "../../components/Header/Header";
import Recommendations from "../../components/Recommendations/Recommendations";
import { useMedia } from "../../context/MediaContext";

const HomePage = () => {
  const navigate = useNavigate();

  const {
    myList,
    addToMyList,
    recommendations,
    isLoadingRecommendations,
    fetchRecommendations,
    playMedia,
    closeModal,
    isModalOpen,
    trailerKey,
    handleSearchInputChange,
    showSearchResults,
    searchQuery,
    searchResults,
    setShowSearchResults,
    API_KEY,
    BASE_URL,
    IMAGE_BASE_URL,
    BACKDROP_BASE_URL,
  } = useMedia();

  const [trendingContent, setTrendingContent] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [didFetchRecommendations, setDidFetchRecommendations] = useState(false);

  const getGenres = React.useCallback((genreIds) => {
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Sci-Fi",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    };

    return genreIds
      .slice(0, 3)
      .map((id) => genreMap[id] || "")
      .filter(Boolean)
      .join(" • ");
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);

        const responses = await Promise.all([
          fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`),
        ]);

        const [
          trendingData,
          newReleasesData,
          topRatedData,
          popularShowsData,
          comedyData,
        ] = await Promise.all(responses.map((res) => res.json()));

        const formatMovieData = (movies) => {
          return movies.map((movie) => {
            const title = movie.title || movie.name;
            const isMovie = movie.media_type === "movie" || movie.title;
            return {
              id: movie.id,
              image: movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "/assets/images/placeholder.jpg",
              backdropPath: movie.backdrop_path
                ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
                : null,
              title: title,
              rating: movie.adult ? "U/A 18+" : "U/A 13+",
              duration: isMovie ? "Movie" : "TV Series",
              genres: getGenres(movie.genre_ids),
              overview: movie.overview,
              mediaType: movie.media_type || (isMovie ? "movie" : "tv"),
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
        console.error("Error fetching movie data:", error);
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [API_KEY, BASE_URL, IMAGE_BASE_URL, BACKDROP_BASE_URL, getGenres]);

  useEffect(() => {
    if (myList && myList.length > 0 && !didFetchRecommendations) {
      console.log("Fetching recommendations on HomePage mount");
      fetchRecommendations();
      setDidFetchRecommendations(true);
    }
  }, [myList, fetchRecommendations, didFetchRecommendations]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const handleAddToList = (item, event) => {
    addToMyList(item, event);
  };

  return (
    <div className="home-page min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
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
        <div
          className="loading"
          style={{ color: "white", textAlign: "center", padding: "50px" }}
        >
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
                  : null,
              }}
            >
              <div className="banner-content">
                <h2
                  className="feahead"
                  style={{
                    color: "white",
                    backgroundColor: "rgb(146, 17, 155",
                    padding: "3px 5px",
                    width: "183px",
                    borderRadius: "7px",
                    fontWeight: "bold",
                  }}
                >
                  {featuredMovie.mediaType === "movie"
                    ? "Featured Movie"
                    : "Featured Show"}
                </h2>
                <h1>{featuredMovie.title}</h1>
                <p>{featuredMovie.genres}</p>
                <p>{featuredMovie.overview}</p>
                <div className="buttons">
                  <button
                    onClick={() => playMedia(featuredMovie)}
                    className="play-btn"
                  >
                    ▶ Play
                  </button>
                  <button className="info-btn">ℹ More Info</button>
                </div>
              </div>
            </div>
          )}

          <MovieSlider
            title="Trending Now"
            movies={trendingContent}
            onPlayMovie={playMedia}
          />
          <MovieSlider
            title="New Releases"
            movies={newReleases}
            onPlayMovie={playMedia}
          />
          <MovieSlider
            title="Top Rated TV Shows"
            movies={topRatedShows}
            onPlayMovie={playMedia}
          />
          <MovieSlider
            title="Popular Shows"
            movies={popularShows}
            onPlayMovie={playMedia}
          />
          <MovieSlider
            title="Comedy Movies"
            movies={comedyMovies}
            onPlayMovie={playMedia}
          />

          {myList && myList.length > 0 && (
            <div className="recommendations-section">
              <Recommendations
                recommendations={recommendations}
                isLoading={isLoadingRecommendations}
                onPlayMedia={playMedia}
                onAddToMyList={handleAddToList}
              />
            </div>
          )}

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
