import React from 'react';
import { Link } from 'react-router-dom';

const Booking = () => {
return (
 <section className="py-5 text-center bg-body text-body">
        <div className="container">
            <h2 className="display-5 fw-bold mb-4">Book a driving Course now!</h2>
            <p className="fs-5 mb-5">Buy more lessons & get more discount</p>
            <Link to="/courses" className="btn btn-secondary fw-bold">Take Courses</Link>
        </div>
    </section>
);
};

export default Booking;