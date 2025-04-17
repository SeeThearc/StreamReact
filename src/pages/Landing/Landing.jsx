import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, User, Menu, X } from "lucide-react";

export default function StreamingPlatform() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Top 10 movies with placeholder data
  const topMovies = [
    {
      id: 1,
      title: "Cosmic Odyssey",
      rating: 9.5,
      genre: "Sci-Fi",
      image: "/api/placeholder/800/450",
    },
    {
      id: 2,
      title: "Eternal Shadows",
      rating: 9.3,
      genre: "Drama",
      image: "/api/placeholder/800/450",
    },
    {
      id: 3,
      title: "Digital Frontiers",
      rating: 9.2,
      genre: "Action",
      image: "/api/placeholder/800/450",
    },
    {
      id: 4,
      title: "Quantum Dreams",
      rating: 9.0,
      genre: "Thriller",
      image: "/api/placeholder/800/450",
    },
    {
      id: 5,
      title: "Neon Dynasty",
      rating: 8.9,
      genre: "Cyberpunk",
      image: "/api/placeholder/800/450",
    },
    {
      id: 6,
      title: "Azure Horizons",
      rating: 8.8,
      genre: "Adventure",
      image: "/api/placeholder/800/450",
    },
    {
      id: 7,
      title: "Virtual Realms",
      rating: 8.7,
      genre: "Fantasy",
      image: "/api/placeholder/800/450",
    },
    {
      id: 8,
      title: "Crystal Visions",
      rating: 8.6,
      genre: "Mystery",
      image: "/api/placeholder/800/450",
    },
    {
      id: 9,
      title: "Parallel Lives",
      rating: 8.5,
      genre: "Romance",
      image: "/api/placeholder/800/450",
    },
    {
      id: 10,
      title: "Nebula Rising",
      rating: 8.4,
      genre: "Space Opera",
      image: "/api/placeholder/800/450",
    },
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === topMovies.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [topMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === topMovies.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? topMovies.length - 1 : prev - 1));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            DIMENSION
          </div>
        </div>

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
          <a
            href="#pricing"
            className="hover:text-purple-300 transition-colors"
          >
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
            href="#pricing"
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

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center px-6">
        {/* 3D-like background effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl transform rotate-6 scale-105 blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-blue-500/20 to-purple-500/20 rounded-3xl transform -rotate-3 scale-110 blur-xl"></div>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Immersive 3D Streaming Experience
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-300">
            Dive into a new dimension of entertainment with cutting-edge 3D
            technology
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
          Top 10 Trending Movies
        </h2>

        {/* Movie Slider */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {topMovies.map((movie) => (
                <div key={movie.id} className="min-w-full">
                  <div className="relative mx-4 rounded-xl overflow-hidden group transform transition-all duration-300 hover:scale-105 cursor-pointer">
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
                          <p className="text-sm text-gray-300">{movie.genre}</p>
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
            {topMovies.map((_, idx) => (
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
              <h3 className="text-xl font-bold mb-3">True 3D Experience</h3>
              <p className="text-gray-400">
                Immerse yourself in cutting-edge 3D technology that brings films
                to life like never before.
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
            Join thousands of users already enjoying our immersive 3D content
            library.
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

      {/* Footer */}
      <footer className="py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#careers"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#press"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#help"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#terms"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#cookies"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="#twitter"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#facebook"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#instagram"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm7.846-10.405a1.441 1.441 0 11-2.883 0 1.441 1.441 0 012.883 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
              DIMENSION
            </div>
            <p className="text-gray-500">
              © 2025 Dimension Streaming. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
