import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useCourses from '../hooks/useCourses';
import {
  TabNavigation,
  CourseCard,
  CourseModal,
  LoadingIndicator,
  ErrorMessage
} from '../components/Courses';
import Footer from '../components/Footer';
import { ThemeContext } from '../context/ThemeContext';

const CoursesPage = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {
    activeTab,
    setActiveTab,
    openCourses,
    myCourses,
    loading,
    error,
    showModal,
    selectedCourse,
    handleShowModal,
    handleCloseModal
  } = useCourses();
  
  const navigate = useNavigate();

  const handleEnroll = (course) => {
    navigate(`/enroll/${course.id}`);
  };

  if (loading) return <LoadingIndicator fullPage />;
  if (error) return <ErrorMessage error={error} fullPage />;

  return (
    <div
      className={`container-fluid d-flex flex-column min-vh-100 ${isDark ? 'bg-dark text-light' : 'bg-light text-body'}`}
    >
      <main className="flex-grow-1 py-4">
        <div className="container">
          <h1 className="mb-4 text-center">Courses</h1>
          
          <TabNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            className="mb-4"
          />

          <div className="row">
            {(activeTab === 'myCourses' ? myCourses : openCourses).map(course => (
              <div key={course.id} className="col-lg-4 col-md-6 mb-4">
                <CourseCard
                  course={course}
                  type={activeTab}
                  onShowDescription={handleShowModal}
                  refreshDatabase={() => { /* optional: reload courses */ }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <CourseModal 
        show={showModal} 
        course={selectedCourse} 
        onClose={handleCloseModal} 
      />
      <Footer />
    </div>
  );
};

export default CoursesPage;
