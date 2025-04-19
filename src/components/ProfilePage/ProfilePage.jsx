import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMedia } from "../../context/MediaContext";
import Header from "../Header/Header";
import "./Profile.css";

const ProfilePage = () => {
  const {
    currentUser,
    userProfile,
    isLoadingProfile,
    updateUserProfile,
    checkUsernameAvailability,
    fetchViewingHistory,
    playMedia,
  } = useMedia();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    language: "en",
    maturityRating: "U/A 13+",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [viewingHistory, setViewingHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        username: userProfile.username || "",
        language: userProfile.preferences?.language || "en",
        maturityRating: userProfile.preferences?.maturityRating || "U/A 13+",
      });

      loadViewingHistory();
    }
  }, [currentUser, userProfile]);

  const loadViewingHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await fetchViewingHistory();
      setViewingHistory(history);
    } catch (error) {
      console.error("Error loading viewing history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username" && value !== userProfile?.username) {
      checkUsername(value);
    }
  };

  const checkUsername = async (username) => {
    if (username.length < 3) return;

    const isAvailable = await checkUsernameAvailability(username);
    setUsernameAvailable(isAvailable);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usernameAvailable) return;

    setIsSaving(true);
    try {
      const success = await updateUserProfile({
        displayName: formData.displayName,
        username: formData.username,
        preferences: {
          language: formData.language,
          maturityRating: formData.maturityRating,
        },
      });

      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    navigate("/");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="profile-page min-h-screen bg-gradient-to-br from-black to-purple-900 text-white overflow-hidden">
      <Header />

      <div className="content-container">
        <div className="profile-container">
          <h1>My Profile</h1>

          {isLoadingProfile ? (
            <div className="loading">Loading profile...</div>
          ) : (
            <div className="profile-content">
              <div className="profile-header">
                <div className="profile-image">
                  <img
                    src="https://i.redd.it/2yncnjghlme81.jpg"
                    alt="Profile"
                  />
                </div>

                <div className="profile-info">
                  {!isEditing ? (
                    <>
                      <h2>{userProfile?.displayName}</h2>
                      <p>@{userProfile?.username}</p>
                      <p>Email: {currentUser.email}</p>
                      <p>
                        Member since:{" "}
                        {new Date(userProfile?.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        Language:{" "}
                        {formData.language === "en"
                          ? "English"
                          : formData.language}
                      </p>
                      <p>Maturity Rating: {formData.maturityRating}</p>

                      <div className="action-buttons">
                        <button
                          className="edit-profile-btn"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </button>

                        <button
                          className="sign-out-btn"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="edit-profile-form">
                      <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          minLength={3}
                          className={!usernameAvailable ? "error" : ""}
                        />
                        {!usernameAvailable && (
                          <p className="error-message">
                            Username already taken
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="language">Preferred Language</label>
                        <select
                          id="language"
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="maturityRating">Maturity Rating</label>
                        <select
                          id="maturityRating"
                          name="maturityRating"
                          value={formData.maturityRating}
                          onChange={handleInputChange}
                        >
                          <option value="U">U (All ages)</option>
                          <option value="U/A 7+">U/A 7+</option>
                          <option value="U/A 13+">U/A 13+</option>
                          <option value="U/A 16+">U/A 16+</option>
                          <option value="A">A (18+)</option>
                        </select>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="save-btn"
                          disabled={isSaving || !usernameAvailable}
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <div className="viewing-history">
                <h2>Recently Watched</h2>

                {isLoadingHistory ? (
                  <div className="loading">Loading history...</div>
                ) : viewingHistory.length === 0 ? (
                  <p>You haven't watched anything yet.</p>
                ) : (
                  <div className="history-grid">
                    {viewingHistory.slice(0, 6).map((item) => (
                      <div
                        key={`${item.mediaType}-${item.id}-${item.watchedAt}`}
                        className="history-item"
                        onClick={() => playMedia(item)}
                      >
                        <img src={item.image} alt={item.title} />
                        <div className="history-item-info">
                          <h4>{item.title}</h4>
                          <p>{item.mediaType === "tv" ? "TV Show" : "Movie"}</p>
                          <p className="watched-date">
                            Watched on{" "}
                            {new Date(item.watchedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
