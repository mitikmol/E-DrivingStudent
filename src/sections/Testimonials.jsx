import React from 'react';

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
 <section className="py-5 bg-body text-body">
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

export default Testimonials;