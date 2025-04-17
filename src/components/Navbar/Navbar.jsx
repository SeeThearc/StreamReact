import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";
import { useMedia } from "../../context/MediaContext";
import "./Navbar.css";
import { getAuth, signOut } from "firebase/auth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get data from context
  const {
    currentUser,
    userProfile,
    searchQuery,
    handleSearchInputChange,
    showSearchResults,
    setShowSearchResults,
  } = useMedia();

  const isSignUpPage =
    location.pathname === "/signup" ||
    location.pathname === "/plans" ||
    location.pathname === "/success";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Close search results when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container") && showSearchResults) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSearchResults, setShowSearchResults]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Logo size="large" />

        {!isSignUpPage && (
          <ul className="nav-items desktop-menu">
            <li className="nav-item">
              <Link to="/browse" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/tv-shows" className="nav-link">
                TV Shows
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/movies" className="nav-link">
                Movies
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/my-list" className="nav-link">
                My List
              </Link>
            </li>
          </ul>
        )}
      </div>

      {isSignUpPage ? (
        <Link to="/">
          <button className="sign-out-btn">Sign Out</button>
        </Link>
      ) : (
        <div className="navbar-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          {currentUser ? (
            <div className="profile-simple">
              <img
                src={
                  userProfile?.photoURL || "/assets/images/default-avatar.png"
                }
                alt="Profile"
                className="profile-avatar"
              />
              <span className="username-display">
                {userProfile?.displayName || "User"}
              </span>
              <button className="logout-btn" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="login-btn">Sign In</button>
            </Link>
          )}

          <div className="mobile-menu-toggle" onClick={toggleMenu}>
            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && !isSignUpPage && (
        <div className="mobile-menu">
          <ul className="mobile-nav-items">
            <li className="mobile-nav-item">
              <Link to="/browse" className="nav-link">
                Home
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/tv-shows" className="nav-link">
                TV Shows
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/movies" className="nav-link">
                Movies
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/my-list" className="nav-link">
                My List
              </Link>
            </li>
            {currentUser && (
              <li className="mobile-nav-item">
                <Link to="/profile" className="nav-link">
                  Account
                </Link>
              </li>
            )}
            {currentUser ? (
              <li className="mobile-nav-item" onClick={handleSignOut}>
                Sign out
              </li>
            ) : (
              <li className="mobile-nav-item">
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
