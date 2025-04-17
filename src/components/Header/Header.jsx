import React, { useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMedia } from "../../context/MediaContext"; // Make sure to import the context

const Header = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchResults,
  showSearchResults,
  playShow,
  searchPlaceholder = "Search content...",
}) => {
  const searchResultsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useMedia(); // Get user data from context

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        if (typeof showSearchResults === "function") {
          showSearchResults(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearchResults]);

  const redirectToSignOut = () => {
    navigate("/");
  };

  const redirectToProfile = () => {
    navigate("/profile");
  };

  const getActiveClass = (path) =>
    location.pathname === path ? "head-opt active" : "head-opt";

  // Show user profile menu when avatar is clicked
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="head-left">
        <div className="logo">
          <p style={{ color: "rgb(146, 17, 155)" }}>Stream</p>
          <p style={{ color: "#fff" }}>Sphere.</p>
        </div>
        <div className="head-options">
          <Link to="/home" className={getActiveClass("/home")}>
            Home
          </Link>
          <Link to="/movies" className={getActiveClass("/movies")}>
            Movies
          </Link>
          <Link to="/webseries" className={getActiveClass("/webseries")}>
            Web Series
          </Link>
          <Link to="/mylist" className={getActiveClass("/mylist")}>
            My List
          </Link>
        </div>
      </div>

      <div className="head-right">
        <div className="search-container">
          <form onSubmit={onSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={onSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "white" }}
              ></i>
            </button>
          </form>

          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results" ref={searchResultsRef}>
              {searchResults.map((item) => (
                <div
                  key={`${item.mediaType}-${item.id}`}
                  className="search-result-item"
                  onClick={() => playShow(item)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="search-result-image"
                  />
                  <div className="search-result-info">
                    <h4>{item.title}</h4>
                    <p>
                      {item.duration} • {item.genres}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <i
          className="fa-solid fa-bell head-logo"
          style={{ color: "white" }}
        ></i>

        {/* Profile section with dropdown menu */}
        <div className="profile-dropdown" ref={profileMenuRef}>
          <div
            className="profile-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img
              src="src\assets\images\pro.jpeg"
              alt="profile"
              height="40px"
              className="pro"
            />
            <i
              className="fa-solid fa-caret-down head-logo"
              style={{ color: "white" }}
            ></i>
          </div>

          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <p className="username">{userProfile?.displayName || "User"}</p>
                <p className="email">{currentUser?.email || ""}</p>
              </div>

              <div className="profile-menu-items">
                <div className="profile-menu-item" onClick={redirectToProfile}>
                  <i className="fa-solid fa-user"></i>
                  <span>Profile</span>
                </div>

                <div
                  className="profile-menu-item"
                  onClick={() => navigate("/mylist")}
                >
                  <i className="fa-solid fa-bookmark"></i>
                  <span>My List</span>
                </div>

                <div className="profile-menu-separator"></div>

                <div className="profile-menu-item" onClick={redirectToSignOut}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
