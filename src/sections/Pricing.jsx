import React from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <section className="py-5 text-center">
      <div className="container">
        <h2 className="display-5 fw-bold mb-4">Driving School Packages</h2>
        <p className="fs-5 mb-5">Choose a package that fits your learning needs</p>
        <div className="row">
          {/* Beginner Package */}
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h1 className="card-title pricing-card-title">
                  10,000 Birr <small className="text-muted">/ course</small>
                </h1>
                <ul className="list-unstyled mt-3 mb-4">
                  <li>5 driving lessons</li>
                  <li>Basic road safety training</li>
                  <li>Email support</li>
                  <li>Access to learning materials</li>
                </ul>
                <Link to="/courses" className="w-100 btn btn-lg btn-outline-primary">
                  Take Course
                </Link>
              </div>
            </div>
          </div>

          {/* Intermediate Package */}
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h1 className="card-title pricing-card-title">
                  20,000 Birr <small className="text-muted">/ course</small>
                </h1>
                <ul className="list-unstyled mt-3 mb-4">
                  <li>10 driving lessons</li>
                  <li>Advanced road safety training</li>
                  <li>Priority email support</li>
                  <li>Access to learning materials</li>
                </ul>
                <Link to="/courses" className="w-100 btn btn-lg btn-primary">
                  Take Course
                </Link>
              </div>
            </div>
          </div>

          {/* Advanced Package */}
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h1 className="card-title pricing-card-title">
                  30,000 Birr <small className="text-muted">/ course</small>
                </h1>
                <ul className="list-unstyled mt-3 mb-4">
                  <li>15 driving lessons</li>
                  <li>Highway and night driving training</li>
                  <li>Phone and email support</li>
                  <li>Access to advanced learning materials</li>
                </ul>
                <Link to="/courses" className="w-100 btn btn-lg btn-primary">
                  Take Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
