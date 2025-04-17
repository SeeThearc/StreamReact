import React, { createContext, useState, useContext, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Create the context
export const MediaContext = createContext();

// Create a custom hook to easily use the context
export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
  // Shared state
  const [trailerKey, setTrailerKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [myList, setMyList] = useState([]);

  // New state for recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  // User profile state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Firebase references
  const db = getFirestore();
  const auth = getAuth();

  // API configuration
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

  // Gemini API configuration
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Add this to your .env file
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.uid);
        fetchUserList(user.uid);
      } else {
        setUserProfile(null);
        // Load from localStorage when not logged in
        const savedList = localStorage.getItem("myList");
        if (savedList) {
          setMyList(JSON.parse(savedList));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // Create a default profile if none exists
        const defaultProfile = {
          username: `user_${userId.substring(0, 5)}`,
          displayName: "StreamSphere User",
          photoURL: "StreamReactsrcassetsimagesdef_prof.png",
          createdAt: new Date().toISOString(),
          preferences: {
            language: "en",
            maturityRating: "U/A 13+",
          },
        };

        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;

    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, profileData);

      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        ...profileData,
      }));

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return true; // Username is available
      }

      // If the only document is the current user's, it's still available
      if (querySnapshot.size === 1 && currentUser) {
        const doc = querySnapshot.docs[0];
        return doc.id === currentUser.uid;
      }

      return false; // Username is taken
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  // Fetch user's saved list from Firestore
  const fetchUserList = async (userId) => {
    try {
      const userListRef = doc(db, "userLists", userId);
      const userListDoc = await getDoc(userListRef);

      if (userListDoc.exists() && userListDoc.data().items) {
        setMyList(userListDoc.data().items);
      } else {
        // Try to load from localStorage if available and sync to Firestore
        const savedList = localStorage.getItem("myList");
        if (savedList) {
          const parsedList = JSON.parse(savedList);
          setMyList(parsedList);
          await setDoc(userListRef, {
            items: parsedList,
            updatedAt: new Date().toISOString(),
          });
        } else {
          setMyList([]);
        }
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
      // Fallback to localStorage
      const savedList = localStorage.getItem("myList");
      if (savedList) {
        setMyList(JSON.parse(savedList));
      }
    }
  };

  // Save user list to Firestore
  const saveUserListToFirestore = async (updatedList) => {
    if (!currentUser) return;

    try {
      const userListRef = doc(db, "userLists", currentUser.uid);
      await setDoc(userListRef, {
        items: updatedList,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving list to Firestore:", error);
    }
  };

  // Genre maps
  const movieGenreMap = {
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
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  const tvGenreMap = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western",
  };

  // Helper functions
  const getGenres = (genreIds, mediaType) => {
    const genreMap = mediaType === "tv" ? tvGenreMap : movieGenreMap;
    return genreIds
      .slice(0, 3)
      .map((id) => genreMap[id] || "")
      .filter((genre) => genre !== "")
      .join(" • ");
  };

  const formatMovieData = (items, mediaType = "movie") => {
    return items.map((item) => {
      return {
        id: item.id,
        image: item.poster_path
          ? `${IMAGE_BASE_URL}${item.poster_path}`
          : "/assets/images/placeholder.jpg",
        backdropPath: item.backdrop_path
          ? `${BACKDROP_BASE_URL}${item.backdrop_path}`
          : null,
        title: mediaType === "tv" ? item.name : item.title,
        rating: item.adult ? "U/A 18+" : "U/A 13+",
        duration: mediaType === "tv" ? "TV Series" : "Movie",
        genres: getGenres(item.genre_ids || [], mediaType),
        overview: item.overview,
        mediaType: mediaType,
      };
    });
  };

  const playMedia = async (media) => {
    try {
      const endpoint = media.mediaType === "tv" ? "tv" : "movie";
      const videoResponse = await fetch(
        `${BASE_URL}/${endpoint}/${media.id}/videos?api_key=${API_KEY}`
      );
      const videoData = await videoResponse.json();

      const trailer = videoData.results.find(
        (video) => video.type === "Trailer" || video.type === "Teaser"
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setIsModalOpen(true);
        setShowSearchResults(false);
        setSearchQuery("");

        // Track viewing history in Firestore if user is logged in
        if (currentUser) {
          try {
            const historyRef = doc(db, "viewingHistory", currentUser.uid);
            const historyDoc = await getDoc(historyRef);

            const newHistoryItem = {
              id: media.id,
              title: media.title,
              mediaType: media.mediaType,
              image: media.image,
              watchedAt: new Date().toISOString(),
            };

            if (historyDoc.exists()) {
              const history = historyDoc.data().items || [];
              // Add to beginning and limit to 50 items
              const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
              await updateDoc(historyRef, { items: updatedHistory });
            } else {
              await setDoc(historyRef, { items: [newHistoryItem] });
            }
          } catch (error) {
            console.error("Error updating viewing history:", error);
          }
        }
      } else {
        console.log("No trailer available for this title");
        alert("No trailer available for this title");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      alert("Could not play trailer at this time");
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
    return myList.some(
      (listItem) =>
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

      // Save to localStorage for non-logged in users
      localStorage.setItem("myList", JSON.stringify(updatedList));

      // Save to Firestore if logged in
      if (currentUser) {
        saveUserListToFirestore(updatedList);
      }
    }
  };

  // Remove item from my list
  const removeFromMyList = (item, event) => {
    // Prevent triggering the parent click events
    if (event) {
      event.stopPropagation();
    }

    const updatedList = myList.filter(
      (listItem) =>
        !(listItem.id === item.id && listItem.mediaType === item.mediaType)
    );
    setMyList(updatedList);

    // Update localStorage
    localStorage.setItem("myList", JSON.stringify(updatedList));

    // Update Firestore if logged in
    if (currentUser) {
      saveUserListToFirestore(updatedList);
    }
  };

  // Get viewing history
  const fetchViewingHistory = async () => {
    if (!currentUser) return [];

    try {
      const historyRef = doc(db, "viewingHistory", currentUser.uid);
      const historyDoc = await getDoc(historyRef);

      if (historyDoc.exists() && historyDoc.data().items) {
        return historyDoc.data().items;
      }
      return [];
    } catch (error) {
      console.error("Error fetching viewing history:", error);
      return [];
    }
  };

  // Search functionality
  useEffect(() => {
    const searchMedia = async (mediaType) => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `${BASE_URL}/search/${mediaType}?api_key=${API_KEY}&query=${encodeURIComponent(
              searchQuery
            )}&page=1`
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
        const movieResults = await searchMedia("movie");
        const tvResults = await searchMedia("tv");
        setSearchResults([...movieResults, ...tvResults]);
        setShowSearchResults(true);

        // Track search in Firestore if user is logged in
        if (currentUser && searchQuery.trim().length > 3) {
          try {
            const searchHistoryRef = doc(db, "searchHistory", currentUser.uid);
            const historyDoc = await getDoc(searchHistoryRef);

            const newSearch = {
              query: searchQuery,
              timestamp: new Date().toISOString(),
              resultCount: movieResults.length + tvResults.length,
            };

            if (historyDoc.exists()) {
              const searches = historyDoc.data().items || [];
              // Add to beginning and limit to 20 searches
              const updatedSearches = [newSearch, ...searches].slice(0, 20);
              await updateDoc(searchHistoryRef, { items: updatedSearches });
            } else {
              await setDoc(searchHistoryRef, { items: [newSearch] });
            }
          } catch (error) {
            console.error("Error updating search history:", error);
          }
        }
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

  const fetchMovies = async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
      const data = await response.json();
      return formatMovieData(data.results, "movie");
    } catch (error) {
      console.error("Error fetching movie data:", error);
      return [];
    }
  };

  const fetchTVShows = async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
      const data = await response.json();
      return formatMovieData(data.results, "tv");
    } catch (error) {
      console.error("Error fetching TV data:", error);
      return [];
    }
  };

  const fetchRecommendations = async () => {
    if (myList.length === 0) {
      console.log("MyList is empty, skipping recommendations");
      setRecommendations([]);
      return;
    }

    setIsLoadingRecommendations(true);
    try {
      console.log("Fetching recommendations for", myList.length, "items");

      // Format the list items for the prompt
      const formattedList = myList
        .map(
          (item) =>
            `${item.title} (${
              item.mediaType === "movie" ? "Movie" : "TV Show"
            }) - ${item.genres}`
        )
        .join("\n");

      console.log("Formatted list for Gemini:", formattedList);

      // Check if the API key is available
      if (!GEMINI_API_KEY) {
        console.error("Gemini API key is missing or undefined");
        throw new Error("Gemini API key not available");
      }

      // Create and use the Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Based on this list of movies and TV shows:
        ${formattedList}
        
        Please recommend 8 similar content that the user might like.
        For each recommendation, provide the title, whether it's a movie or TV show, release year, and a brief reason why the user might like it based on their list.
        Format the response as JSON with the structure:
        [
          {
            "id": "rec-1", 
            "title": "Title",
            "mediaType": "movie" or "tv",
            "year": "Year",
            "reason": "Why the user might like it"
          }
        ]
        Only provide the JSON array, nothing else.
      `;

      console.log("Sending request to Gemini API");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Received response from Gemini");

      let recommendationData;
      try {
        recommendationData = JSON.parse(text);
      } catch (e) {
        console.log("Direct parsing failed, trying to extract JSON");
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            recommendationData = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error(
              "Failed to parse JSON from extracted content:",
              parseError
            );
            throw new Error("Could not parse recommendation data");
          }
        } else {
          console.error("No JSON array found in response");
          throw new Error("Invalid response format");
        }
      }

      if (recommendationData && Array.isArray(recommendationData)) {
        console.log(
          "Successfully parsed recommendations:",
          recommendationData.length
        );

        const basicRecommendations = recommendationData.map((item) => ({
          id: item.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          mediaType: item.mediaType,
          image: "/assets/images/placeholder.jpg",
          backdropPath: null,
          rating: "U/A 13+",
          duration: item.year,
          genres:
            item.mediaType === "movie"
              ? "Recommended Movie"
              : "Recommended Show",
          year: item.year,
          reason: item.reason,
          overview: item.reason,
        }));

        setRecommendations(basicRecommendations);

        try {
          const enhancedRecommendations = await Promise.all(
            basicRecommendations.map(async (rec) => {
              try {
                // Search TMDB for this title
                const searchEndpoint = rec.mediaType === "tv" ? "tv" : "movie";
                const response = await fetch(
                  `${BASE_URL}/search/${searchEndpoint}?api_key=${API_KEY}&query=${encodeURIComponent(
                    rec.title
                  )}`
                );
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                  const match = data.results[0];
                  return {
                    ...rec,
                    image: match.poster_path
                      ? `${IMAGE_BASE_URL}${match.poster_path}`
                      : rec.image,
                    backdropPath: match.backdrop_path
                      ? `${BACKDROP_BASE_URL}${match.backdrop_path}`
                      : null,
                  };
                }
                return rec;
              } catch (err) {
                console.log(`Error finding image for ${rec.title}:`, err);
                return rec;
              }
            })
          );

          setRecommendations(enhancedRecommendations);

          // Store recommendations in Firestore if logged in
          if (currentUser) {
            try {
              const recommendationsRef = doc(
                db,
                "userRecommendations",
                currentUser.uid
              );
              await setDoc(recommendationsRef, {
                items: enhancedRecommendations,
                generatedAt: new Date().toISOString(),
              });
            } catch (err) {
              console.error("Error saving recommendations to Firestore:", err);
            }
          }
        } catch (error) {
          console.error("Error enhancing recommendations with images:", error);
        }
      } else {
        console.error("Invalid recommendations data structure");
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Load recommendations when myList changes
  useEffect(() => {
    // Add debounce to prevent too frequent API calls
    const timer = setTimeout(() => {
      if (myList.length > 0) {
        fetchRecommendations();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [myList]);

  // Load stored recommendations when user logs in
  useEffect(() => {
    const loadStoredRecommendations = async () => {
      if (!currentUser) return;

      try {
        const recommendationsRef = doc(
          db,
          "userRecommendations",
          currentUser.uid
        );
        const recommendationsDoc = await getDoc(recommendationsRef);

        if (recommendationsDoc.exists() && recommendationsDoc.data().items) {
          const storedRecs = recommendationsDoc.data().items;
          const generatedAt = new Date(recommendationsDoc.data().generatedAt);
          const now = new Date();

          // Only use stored recommendations if they're less than 24 hours old
          if (now - generatedAt < 86400000) {
            setRecommendations(storedRecs);
          } else {
            // Otherwise, generate new ones
            fetchRecommendations();
          }
        }
      } catch (error) {
        console.error("Error loading stored recommendations:", error);
      }
    };

    loadStoredRecommendations();
  }, [currentUser]);

  const value = {
    // State
    trailerKey,
    isModalOpen,
    searchQuery,
    searchResults,
    showSearchResults,
    isLoading,
    myList,
    recommendations,
    isLoadingRecommendations,
    currentUser,
    userProfile,
    isLoadingProfile,

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
    removeFromMyList,
    fetchRecommendations,

    // User profile functions
    fetchUserProfile,
    updateUserProfile,
    checkUsernameAvailability,
    fetchViewingHistory,
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};
