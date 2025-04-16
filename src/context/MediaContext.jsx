import React, { createContext, useState, useEffect } from 'react';

export const MediaContext = createContext();

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const MediaProvider = ({ children }) => {
  const [tvData, setTvData] = useState({
    popular: [],
    topRated: [],
    drama: [],
    crime: [],
    sciFi: [],
  });

  const [loading, setLoading] = useState(true);

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
    37: 'Western',
  };

  const getGenres = (genreIds) => {
    return genreIds
      .slice(0, 3)
      .map(id => genreMap[id] || '')
      .filter(genre => genre !== '')
      .join(' • ');
  };

  const formatTVData = (shows) => {
    return shows.map(show => ({
      id: show.id,
      image: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : "/assets/images/placeholder.jpg",
      backdropPath: show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : null,
      title: show.name,
      rating: show.adult ? "U/A 18+" : "U/A 13+",
      duration: "TV Series",
      genres: getGenres(show.genre_ids || []),
      overview: show.overview,
      mediaType: 'tv',
    }));
  };

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all([
          fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=18`), // Drama
          fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=80`), // Crime
          fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`), // Sci-Fi
        ]);

        const data = await Promise.all(responses.map(res => res.json()));

        setTvData({
          popular: formatTVData(data[0].results),
          topRated: formatTVData(data[1].results),
          drama: formatTVData(data[2].results),
          crime: formatTVData(data[3].results),
          sciFi: formatTVData(data[4].results),
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching media data:", error);
        setLoading(false);
      }
    };

    fetchTVData();
  }, []);

  return (
    <MediaContext.Provider value={{ tvData, loading }}>
      {children}
    </MediaContext.Provider>
  );
};

export default MediaProvider;
