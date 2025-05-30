import { useState, useEffect } from 'react';
import { fetchCourses } from '../services/courses';

const useCourses = () => {
  const [activeTab, setActiveTab] = useState('myCourses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const data = await fetchCourses();

      if (!Array.isArray(data)) {
        throw new Error('Courses data is not an array');
      }

      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const refreshDatabase = () => {
    loadCourses();
  };

const openCourses = courses.filter(course => 
  course.enrollment_status === null || 
  course.enrollment_status === "null" ||
  !course.enrollment_status
);  const myCourses = courses.filter(course =>
    course.enrollment_status === 'pending' || course.enrollment_status === 'accepted'
  );

  const handleShowModal = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return {
    activeTab,
    setActiveTab,
    openCourses,
    myCourses,
    loading,
    error,
    showModal,
    selectedCourse,
    handleShowModal,
    handleCloseModal,
    refreshDatabase
  };
};

export default useCourses;
