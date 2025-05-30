import React from 'react';

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
 <section className="py-5 bg-body text-body">
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

export default FAQ;