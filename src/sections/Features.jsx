// File: src/sections/Features.js
import React from 'react';
import { FaStar, FaCertificate, FaCar, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';



const Features = () => {
  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5">Who Teaches You to Drive?</h2>
        <p className="text-center mb-4">Our platform connects you with the best driving instructors in your area, ensuring a safe and effective learning experience.</p>
        <div className="row g-4">
          {[
            { icon: <FaStar />, title: 'Instructor Ratings', text: 'Read reviews and choose an instructor with a proven track record of excellence.' },
            { icon: <FaCertificate />, title: 'Accredited', text: 'We verify instructor credentials to ensure they meet the highest standards.' },
            { icon: <FaCar />, title: 'Vehicle Safety', text: 'Get detailed information about the instructor’s vehicle, including safety ratings.' },
            { icon: <FaExchangeAlt />, title: 'Always Your Choice', text: 'Easily switch instructors anytime through our online portal.' }
          ].map((feat, idx) => (
            <div key={idx} className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 text-warning" style={{ fontSize: '2rem' }}>
                    {feat.icon}
                  </div>
                  <h3 className="card-title fs-4 fw-bold">{feat.title}</h3>
                  <p className="card-text">{feat.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
<Link to="/courses" className="btn btn-warning btn-lg px-5 fw-bold">
  Book Driving Lesson Now
</Link>
        </div>
      </div>
    </section>
  );
};

export default Features;