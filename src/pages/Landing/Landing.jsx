import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import Footer from '../../components/Footer/Footer';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <header>
        <img
          className="clipart"
          src="/assets/images/df4dfyn-661ca43e-10de-4457-bbb7-70726e2f614f.png"
          alt="Spider-Man"
        />

        <div className="container">
          <Logo size="large" />
          <div className="auth-container">
            <h2>Sign In</h2>
            <form>
              <input type="email" placeholder="Email or phone number" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Sign In</button>
              <div className="help-section">
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Need help?</a>
              </div>
            </form>
            <p>New to StreamSphere? <Link to="/signup">Sign up now</Link></p>
          </div>
        </div>
      </header>

      <div className="intro-section">
        <h1>Welcome To StreamSphere!</h1>
        <div className="intro-description">
          <div>
            <p className="intro-description-p">
              StreamSphere isn't just a streaming platform—it's a cinematic
              universe at your fingertips. With breathtaking visuals, ultra-smooth
              playback, and an ever-expanding content library, we bring you
              movies, shows, and live events like never before.
            </p>
          </div>
          <div>
            <img
              className="shield"
              src="/assets/images/Captain-America-Shield-PNG-HD-Quality.png"
              alt="Captain America Shield"
            />
          </div>
          <div>
            <p className="intro-description-p">
              Powered by AI-driven recommendations and cutting-edge streaming
              technology, StreamSphere delivers a personalized, immersive
              experience across all your devices. Whether you're diving into a
              blockbuster, discovering indie gems, or catching live exclusives,
              your next favorite watch is always just a click away.
            </p>
          </div>
        </div>

        <h1>Wanna be a Part of the StreamSphere fam?<br />Join Our Discord Server</h1>
        <div className="discord">
          <button><i className="fa-brands fa-discord"></i> Join</button>
        </div>

        <div className="awards-section">
          <h1>Download Your Favourite Movies Watch Anytime and Anywhere</h1>
          <div>
            <img src="/assets/images/mov-dl.webp" alt="Download movies" />
            <p>
              Watch your favorite movies, shows, and live events on the big screen
              with StreamSphere. Enjoy stunning 4K UHD & HDR quality on Smart TVs,
              PlayStation, Xbox, Chromecast, and more. Simply open the app or cast
              from your device for a seamless, immersive experience. Your
              entertainment, bigger and better.
            </p>
          </div>
        </div>

        <div className="tv-section">
          <h1>Enjoy on your own TV</h1>
          <div>
            <p>
              Watch your favorite movies, shows, and live events on the big screen
              with StreamSphere. Enjoy stunning 4K UHD & HDR quality on Smart TVs,
              PlayStation, Xbox, Chromecast, and more. Simply open the app or cast
              from your device for a seamless, immersive experience. Your
              entertainment, bigger and better.
            </p>
            <img src="/assets/images/pngwing.com.png" alt="TV" />
          </div>
        </div>

        <div className="awards-section">
          <h1>Stream Live Award Shows</h1>
          <div>
            <img src="/assets/images/award1.webp" alt="Award shows" />
            <p>
              Watch your favorite movies, shows, and live events on the big screen
              with StreamSphere. Enjoy stunning 4K UHD & HDR quality on Smart TVs,
              PlayStation, Xbox, Chromecast, and more. Simply open the app or cast
              from your device for a seamless, immersive experience. Your
              entertainment, bigger and better.
            </p>
          </div>
        </div>

        <h1>Exclusive Shows</h1>
        <section className="slider-section">
          <div className="slider-navigation">
            <button className="arrow left" id="scrollLeft">❮</button>
            <div className="slider-container" id="sliderContainer">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <div className="slider-item" key={`m${num}`}>
                  <img src={`/assets/images/m${num}${num <= 2 ? '.png' : num <= 5 ? '.jpg' : num === 9 ? '.webp' : '.jpg'}`} alt={`Show ${num}`} />
                </div>
              ))}
            </div>
            <button className="arrow right" id="scrollRight">❯</button>
          </div>
        </section>

        <h1>Bored of live-actions? Explore our all new Anime section</h1>
        <section className="anime-section">
          <div className="shenron-png">
            <img src="/assets/images/pngwing.com (2).png" alt="Shenron" />
          </div>
          <h1>Trending on StreamSphere</h1>
          <div>
            <div>
              <section className="slider-section">
                <div className="slider-navigation">
                  <div className="slider-container" id="animeSlider">
                    <div className="slider-item">
                      <img src="/assets/images/82402f796b7d84d7071ab1e03ff7747a.jpg" alt="Anime 1" />
                    </div>
                    <div className="slider-item">
                      <img src="/assets/images/9cbcf87f54194742e7686119089478f8.jpg" alt="Anime 2" />
                    </div>
                    <div className="slider-item">
                      <img src="/assets/images/b3da1326e07269ddd8d73475c5dabf2c.jpg" alt="Anime 3" />
                    </div>
                    <div className="slider-item">
                      <img src="/assets/images/db2f3ce7b9cab7fdc160b005bffb899a.png" alt="Anime 4" />
                    </div>
                    <div className="slider-item">
                      <img src="/assets/images/bcd84731a3eda4f4a306250769675065 (1).jpg" alt="Anime 5" />
                    </div>
                    <div className="slider-item">
                      <img src="/assets/images/b51f863b05f30576cf9d85fa9b911bb5.png" alt="Anime 6" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="review-section">
          <h1 className="rev-tag">Enjoying StreamSphere? Check Our Top Reviews</h1>
          <div className="rev-container">
            <div>
              {[...Array(6)].map((_, index) => (
                <div className="review-card" key={index}>
                  <div className="user-info">
                    <img src="/assets/images/pfp1.jpg" alt="User Profile" className="user-pfp" />
                    <div className="user-details">
                      <span className="user-name">Swordex</span>
                      <span className="timestamp">- 2 minutes ago</span>
                    </div>
                  </div>
                  <p className="review-text">
                    this lowkey needed like 100 episodes of them just goin ham on dealers and such sad that we didn't get to see him and his...
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="comment-l">
            <p>Wanna Leave A Review?</p>
            <button>Review</button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Landing;
