import React from 'react';
import { Link } from 'react-router-dom';


const Hero = () => {
  return (
    <section
      style={{
        backgroundColor: 'rgb(18, 32, 47)',
        color: '#FFFFFF',
        marginTop: '4rem',          // ← pushes the whole section down
      }}
      className="py-5 text-center"
    >
      <div className="container py-4">
        <h1 className="display-4 fw-bold mb-4">Welcome to Your Driving Journey</h1>
        <p className="lead mb-5">Learn to drive with confidence and ease</p>
        <div className="d-flex justify-content-center">
      <Link
  to="/courses"
  style={{ backgroundColor: '#FF5722', color: '#FFFFFF' }}
  className="btn btn-lg mx-2 fw-bold"
>
  Get Started
</Link>
          <button
            style={{ borderColor: '#FF5722', color: '#FF5722' }}
            className="btn btn-outline-light btn-lg mx-2 fw-bold"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
