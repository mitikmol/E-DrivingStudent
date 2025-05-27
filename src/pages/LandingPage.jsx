import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FaStar, FaCertificate, FaCar, FaExchangeAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';



// Header Component


// Hero Component
const Hero = () => {
  return (
    <section
      id="home"
      style={{
        backgroundImage:
          'url("https://media.istockphoto.com/id/1254705310/photo/strong-unrecognizable-mid-adult-man-drives-his-car.jpg?s=612x612&w=0&k=20&c=mOcfd2RNkCnNvt2FNt45vfOjJcSxh5-ahbQBhQ88pss=")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        marginTop: '4rem',
        paddingTop: '5rem', // Increased
        paddingBottom: '5rem', // Increased
        position: 'relative',
      }}
      className="hero-section continuous-bg text-center"
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />
      <div
        className="container-xxl py-5"
        style={{ position: 'relative', zIndex: 2 }}
      >
        <h1 className="display-2 fw-bold mb-4">Welcome to Your Driving Journey</h1> {/* Bigger heading */}
        <p className="lead fs-4 mb-5">Learn to drive with confidence and ease</p> {/* Larger lead text */}
        <div className="d-flex justify-content-center">
          <Link
            to="/courses"
            style={{ backgroundColor: '#002936', color: '#FFFFFF' }}
            className="btn btn-lg mx-3 fw-bold px-5 py-3"
          >
            Get Started
          </Link>
          <a
            href="#features"
            style={{  color: '#FFFFFF' }}
            className="btn btn-outline-dark btn-lg mx-3 fw-bold px-5 py-3"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

// Booking Component
const Booking = () => {
  return (
    <section className="py-5 text-center bg-body text-body">
      <div className="container">
        <h2 className="display-5 fw-bold mb-4">Book a driving Course now!</h2>
        <p className="fs-5 mb-5">Buy more lessons & get more discount</p>
            <Link to="/courses"  style={{backgroundcolor:"#002936"}}  className="btn btn-primary fw-bold">Take Courses</Link>
      </div>
    </section>
  );
};

// Features Component
const Features = () => {
  return (
    <section id="features" className="py-5">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5">Who Teaches You to Drive?</h2>
        <p className="text-center mb-4">Our platform connects you with the best driving instructors in your area, ensuring a safe and effective learning experience.</p>
        <div className="row g-4">
          {[
            { icon: <FaStar />, title: 'Instructor Ratings', text: 'Read reviews and choose an instructor with a proven track record of excellence.' },
            { icon: <FaCertificate />, title: 'Accredited', text: 'We verify instructor credentials to ensure they meet the highest standards.' },
            { icon: <FaCar />, title: 'Vehicle Safety', text: 'Get detailed information about the instructors vehicle, including safety ratings.' },
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
          <a href="#pricing" className="btn btn-warning btn-lg px-5 fw-bold">
            Book Driving Lesson Now
          </a>
        </div>
      </div>
    </section>
  );
};

// Testimonials Component
const Testimonials = () => {
  const data = [
    {
      text: '"The driving course was incredibly helpful and made me feel confident on the road!"',
      name: 'Samuel Abebe',
      image: 'https://www.shutterstock.com/image-photo/african-handsome-man-wearing-casual-260nw-1892041549.jpg',
    },
    {
      text: '"Thanks to this course, I passed my driving test on the first try!"',
      name: 'Almaz Tadesse',
      image: 'https://images4.penguinrandomhouse.com/author/2281028',
    },
    {
      text: '"The instructors were patient and knowledgeable. Highly recommend!"',
      name: 'Rebecca Tesfaye',
      image: 'https://media.istockphoto.com/id/518591162/photo/african-woman-outdoors-in-park.jpg?s=612x612&w=0&k=20&c=mSb8AFR8ZSmcsZiETDYFGK0hlkLNpUv_16OAaiUPXpE=',
    },
  ];
  
  return (
    <section id="testimonials" className="py-5 bg-body text-body">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5">What Our Students Say...</h2>
        <div className="row g-4">
          {data.map((item, idx) => (
            <div key={idx} className="col-md-4">
              <div className="card h-100 shadow-sm bg-body text-body">
                <div className="card-body p-4 text-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <p className="fst-italic mb-4">{item.text}</p>
                  <p className="fw-bold mb-0">{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Component
const Pricing = () => {
  return (
    <section id="pricing" className="py-5 text-center">
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
                 <Link to="/courses" className="w-100 btn btn-lg btn-primary">
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

// FAQ Component
const FAQ = () => {
  const faqs = [
    {
      question: 'What is the purpose of this platform?',
      answer: 'This platform is designed to provide users with valuable resources and tools for learning.',
    },
    {
      question: 'How can I get started?',
      answer: 'Getting started is easy! Simply sign up and explore the available features.',
    },
    {
      question: 'Is there customer support available?',
      answer: 'Yes, we offer 24/7 customer support to assist you with any inquiries.',
    },
    {
      question: 'How can I enroll in a course?',
      answer: 'To enroll in a course, navigate to the courses section, select your desired course, and click on the enroll button.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including CBE, Awash, Telebirr and bank transfers.',
    },
  ];

  return (
    <section id="faq" className="py-5 bg-body text-body">
      <div className="container">
        <h2 className="display-5 fw-bold mb-4">Frequently Asked Questions</h2>
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, index) => (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button bg-body text-body"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                >
                  {faq.question}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse bg-body text-body" 
                aria-labelledby={`heading${index}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component


// Main Landing Page Component
export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Booking />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
}