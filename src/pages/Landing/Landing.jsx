import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Footer from "../../components/Footer/Footer";
import { useMedia } from "../../context/MediaContext";
import Logo from "../../components/Logo/Logo";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the Media context
  const { fetchMovies, setIsLoading, API_KEY, BASE_URL, playMedia } =
    useMedia();

  // Fetch top rated movies from API
  useEffect(() => {
    const getTopRatedMovies = async () => {
      try {
        setLoading(true);
        const topRatedMovies = await fetchMovies(
          "/movie/popular?language=en-US&page=1"
        );
        setMovies(topRatedMovies.slice(0, 10));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching top rated movies:", err);
        setError("Failed to load top rated movies");
        setLoading(false);
      }
    };

    getTopRatedMovies();
  }, [fetchMovies]);

  // Auto-scroll functionality
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle movie play
  const handlePlayMovie = (movie) => {
    playMedia(movie);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 flex justify-between items-center">
        <Logo />

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="hover:text-purple-300 transition-colors"
          >
            Features
          </a>
          <a href="/plans" className="hover:text-purple-300 transition-colors">
            Pricing
          </a>
          <a href="#about" className="hover:text-purple-300 transition-colors">
            About
          </a>
          <a
            href="/login"
            className="px-4 py-2 rounded-md border border-purple-500 hover:bg-purple-500 transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-8 text-xl">
          <button className="absolute top-4 right-6" onClick={toggleMenu}>
            <X size={32} />
          </button>
          <a
            href="#features"
            className="hover:text-purple-300 transition-colors"
            onClick={toggleMenu}
          >
            Features
          </a>
          <a
            href="/plans"
            className="hover:text-purple-300 transition-colors"
            onClick={toggleMenu}
          >
            Pricing
          </a>
          <a
            href="#about"
            className="hover:text-purple-300 transition-colors"
            onClick={toggleMenu}
          >
            About
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-md border border-purple-500 hover:bg-purple-500 transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Sign Up
          </a>
        </div>
      )}

      {/* Hero Section with Autoplay Video */}
      <div className="relative h-screen flex items-center justify-center px-6">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>
          <video
            className="absolute w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Your Universe of Entertainment
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-300">
            From thrilling originals to blockbuster hits — stream it all in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="flex items-center justify-center px-8 py-4 bg-black bg-opacity-50 border border-purple-500 rounded-lg text-lg font-bold hover:bg-opacity-70 transition-all"
            >
              <Play size={20} className="mr-2" /> Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Movie Slider Section */}
      <div className="py-16 px-4 relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Top 10 Rated Movies
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center text-red-400 mb-4">
            <p>Error loading movies: {error}</p>
          </div>
        )}

        {/* Movie Slider */}
        {!loading && movies.length > 0 && (
          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {movies.map((movie) => (
                  <div key={movie.id} className="min-w-full">
                    <div
                      className="relative mx-4 rounded-xl overflow-hidden group transform transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => handlePlayMovie(movie)}
                    >
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-64 md:h-96 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>

                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                              {movie.title}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {movie.genres}
                            </p>
                          </div>
                          <div className="bg-purple-600 px-3 py-1 rounded-lg font-bold">
                            {movie.rating}
                          </div>
                        </div>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-purple-600 rounded-full p-4 transform transition-transform group-hover:scale-110">
                          <Play size={32} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {movies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentSlide ? "bg-purple-500 w-6" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Revolutionary Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                AI-Powered Personalized Streaming
              </h3>
              <p className="text-gray-400">
                StreamSphere learns what you love and curates content that
                matches your vibe — no more endless scrolling.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud Streaming</h3>
              <p className="text-gray-400">
                Stream high-quality 3D content with zero buffering on any
                device, anywhere.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Device Access</h3>
              <p className="text-gray-400">
                Enjoy your content on TV, desktop, tablet, VR headsets, or
                mobile with seamless transitions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <div className="py-16 px-4 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future of Streaming?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users already enjoying our Universe
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              className="px-8 py-4 bg-purple-600 rounded-lg text-lg font-bold hover:bg-purple-700 transition-all"
            >
              Start 7-Day Free Trial
            </a>
            <a
              href="/pricing"
              className="px-8 py-4 bg-transparent border border-white rounded-lg text-lg font-bold hover:bg-white hover:bg-opacity-10 transition-all"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
