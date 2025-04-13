import React from 'react';
import './TrailerModal.css';

const TrailerModal = ({ isOpen, onClose, trailerKey }) => {
  if (!isOpen) return null;

  return (
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
        <button className="trailer-modal-close" onClick={onClose}>×</button>
        <div className="trailer-container">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;