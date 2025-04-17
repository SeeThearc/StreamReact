import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import HomePage from "./pages/Home/HomePage";
import SignUp from "./pages/SignUp/SignUp";
import LogIn from "./pages/Login/Login";
import PlansPage from "./pages/Plans/PlansPage";
import SuccessPage from "./pages/Success/SuccessPage";
import NotFound from "./pages/NotFound/NotFound";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import MoviesPage from "./pages/MoviesPage/MoviesPage";
import WebSeriesPage from "./pages/WebSeriesPage/WebSeriesPage";
import MyListPage from "./pages/MyListPage/MyListPage";
import { MediaProvider } from "./context/MediaContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    <MediaProvider>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/webseries" element={<WebSeriesPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/myList" element={<MyListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </MediaProvider>
  );
};

export default App;
