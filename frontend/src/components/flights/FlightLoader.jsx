import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './FlightLoader.css';

const FlightLoader = ({ message = "Securing your fare..." }) => {
  return (
    <div className="flight-loader-overlay">
      <div className="loader-card">
        <div className="lottie-container">
          <DotLottieReact
            src="https://lottie.host/01858da3-6280-4760-9983-8672ebc0802d/en3ymGGHvw.lottie"
            loop
            autoplay
          />
        </div>
        <h3>{message}</h3>
        <p>Please wait while we process your request</p>
      </div>
    </div>
  );
};

export default FlightLoader;
