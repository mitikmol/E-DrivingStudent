  import PropTypes from 'prop-types';
  import { useContext, useRef, useState } from 'react';
  import { Alert, Button, Modal, Toast, ToastContainer } from 'react-bootstrap';
  import { useNavigate } from 'react-router-dom';
  import { DocumentStatusContext } from '../../context/DocumentStatusContext';
  import {
    apiClient,
    cancelEnrollment,
    createPayment
  } from '../../services/enrollmentService';
  import CancelModal from './modals/CancelModal';
  import EnrollmentModal from './modals/EnrollmentModal';
  import PaymentModal from './modals/PaymentModal';
  import PendingModal from './modals/PendingModal';

  // Storage keys
  const ENROLLMENT_KEY = 'currentEnrollment';
  const DOC_STATUS_KEY = 'documentStatus';
  const COURSE_ID_KEY = 'currentCourseId';

  const CourseCard = ({ course, type, onShowDescription, refreshDatabase }) => {
    const navigate = useNavigate();
    
    // Determine if this is a "My Course" based on enrollment status
    const isMyCourse = course.enrollment_status === 'pending' || 
                      course.enrollment_status === 'accepted';

    // User document submission status
    const { status, markSubmitted } = useContext(DocumentStatusContext);
    const docSubmitted = status === 'submitted';
    
    // Enrollment status - use the status from the course prop
    const [enrollmentStatus, setEnrollmentStatus] = useState(course.enrollment_status);
    const [enrollmentData, setEnrollmentData] = useState(() => {
      const savedData = localStorage.getItem(`enrollmentData_${course?.id}`);
      return savedData ? JSON.parse(savedData) : null;
    });

    // Modal states
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
    const [documentStatusMessage, setDocumentStatusMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentEnrollmentId, setCurrentEnrollmentId] = useState(null);

    // Form and loading states
    const [formData, setFormData] = useState({
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      age: '',
      sex: 'Male',
      phone_number: '',
      education_level: '',
      state: '',
      zone: '',
      woreda: '',
      city: '',
      national_id: null,
      educational_certificate: null,
      medical_report: null,
      user_image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');

    // File input refs
    const fileInputRefs = {
      national_id: useRef(null),
      educational_certificate: useRef(null),
      medical_report: useRef(null),
      user_image: useRef(null)
    };

    // Helper functions for localStorage
    const getStored = (key) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.error(`Error reading ${key}:`, err);
        return null;
      }
    };

    const setStored = (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    };

    const clearEnrollmentData = () => {
      localStorage.removeItem(ENROLLMENT_KEY);
      localStorage.removeItem(COURSE_ID_KEY);
      localStorage.setItem(DOC_STATUS_KEY, 'notsubmitted');
    };

    const showUserToast = (message, variant = 'success') => {
      setToastMessage(message);
      setToastVariant(variant);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    const handleChange = e => {
      const { name, value } = e.target;
      setFormData(fd => ({ ...fd, [name]: value }));
    };

    const handleFileChange = (e, field) => {
      if (e?.target?.files?.[0]) {
        setFormData(fd => ({ ...fd, [field]: e.target.files[0] }));
      }
    };

    const handlePaymentSubmit = async (paymentData, courseId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        // 1. Create enrollment
        const enrollmentRes = await apiClient.post(`/enrollments/create/${courseId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const enrollment = enrollmentRes.data;
        if (!enrollment?.id) throw new Error('No valid enrollment created');

        // 2. Process payment
        const response = await createPayment(
          enrollment.id,
          paymentData.amount,
          paymentData.paymentProof,
          token
        );

        localStorage.setItem('paymentCompleted', 'true');
        showUserToast('Payment processed successfully!');
        setShowPaymentModal(false);
        refreshDatabase?.();
      } catch (error) {
        console.error('Payment error:', error);
        showUserToast(
          error.response?.data?.message || 'Payment failed. Please try again.',
          'danger'
        );
      }
    };

  const handleEnrollClick = async () => {
      const documentInfo = await fetchDocumentStatus();
  const { status: documentStatus, remarks } = documentInfo;
    
    if (!course?.id) {
      showUserToast('Invalid course selection', 'danger');
      return;
    }

    // If already enrolled and approved, go to course
    if (course.enrollment_status === 'accepted') {
      navigate(`/courses/${course.id}/lessons`);
      return;
    }

    // const documentStatus = await fetchDocumentStatus();  // 👈 fetch fresh status

    if (!documentStatus || documentStatus === 'notsubmitted') {
      setDocumentStatusMessage('Please submit your documents first.');
      setShowDocumentStatusModal(true);
      return;
    }

    if (documentStatus === 'pending') {
      setDocumentStatusMessage('Your documents are pending review.');
      setShowDocumentStatusModal(true);
      return;
    }

    if (documentStatus === 'rejected') {
      const remarkText = remarks?.trim()
        ? `\n\n---\n${remarks.trim()}\n---\n`
        : '\n\n(No reason given)';
      setDocumentStatusMessage(
        `❗ Your documents were rejected.\n${remarkText}\nPlease review the feedback above and resubmit your documents.`
      );
      setShowDocumentStatusModal(true);
      return;
    }

    if (documentStatus === 'approved') {
      setShowPaymentModal(true);
      return;
    }

    setShowEnrollModal(true); // fallback
  };

const fetchDocumentStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const res = await apiClient.get('/register/documentStatus', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const info = res.data?.data || {};
    // Persist for later (so handleEnrollSubmit can PUT on resubmit)
    if (info.registration_id) {
      localStorage.setItem(ENROLLMENT_KEY, JSON.stringify({ id: info.registration_id }));
    }
    localStorage.setItem(DOC_STATUS_KEY, info.status);
    return info;
  } catch (error) {
    console.error('Failed to fetch document status:', error);
    return {};
  }
};

    const handleApprovedEnrollment = async (enrollment) => {
      if (!enrollment?.id) {
        showUserToast('Enrollment data missing. Please enroll again.', 'danger');
        clearEnrollmentData();
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/enrollments/${enrollment.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status !== 'approved') {
          throw new Error('Enrollment not approved');
        }

        setCurrentEnrollmentId(enrollment.id);
        setShowPaymentModal(true);
      } catch (error) {
        console.error('Enrollment verification failed:', error);
        showUserToast('Enrollment verification failed. Please enroll again.', 'danger');
        clearEnrollmentData();
      }
    };

    const enrollCourseOnly = async () => {
      if (!course) {
        showUserToast('Course data not available', 'danger');
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await apiClient.post('/enrollments', {
          courseId: course.id,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const enrollment = response.data;
        localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollment));
        localStorage.setItem(DOC_STATUS_KEY, 'approved');
        localStorage.setItem(COURSE_ID_KEY, course.id);
        setCurrentEnrollmentId(enrollment.id);
        setShowPaymentModal(true);

      } catch (error) {
        console.error('Enrollment error:', error);
        showUserToast(
          error.response?.data?.message || 'Failed to enroll in course',
          'danger'
        );
      } finally {
        setLoading(false);
      }
    };

  const handleCancelEnrollment = async () => {
    if (!enrollmentData) {
      showUserToast('No enrollment data found to cancel', 'danger');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await cancelEnrollment(enrollmentData.id, token);

      // Clear enrollment status
      setEnrollmentStatus(null);
      setEnrollmentData(null);
      localStorage.removeItem(`enrollmentStatus_${course.id}`);
      localStorage.removeItem(`enrollmentData_${course.id}`);
      
      showUserToast('Enrollment cancelled successfully');
      setShowCancelModal(false);
      refreshDatabase?.();
    } catch (err) {
      console.error('Cancellation error:', err);
      // const errorMsg = err.response?.data?.message || 
      //                 err.message || 
      //                 'Failed to cancel enrollment';
      // showUserToast(errorMsg, 'danger');
      
      if (err.response?.status === 404) {
        localStorage.removeItem(`enrollmentStatus_${course.id}`);
        localStorage.removeItem(`enrollmentData_${course.id}`);
      }
    } finally {
      setLoading(false);
    }
  };
  // …
// inside CourseCard, alongside your other hooks
const loadExistingRegistration = async () => {
  try {
    const existing = JSON.parse(localStorage.getItem(ENROLLMENT_KEY));
    if (!existing?.id) return;

    const token = localStorage.getItem('token');
    const res = await apiClient.get(`/register/${existing.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const reg = res.data; // your sample payload

    // map the incoming data into your formData shape
    setFormData({
      first_name:     reg.first_name     || '',
      middle_name:    reg.middle_name    || '',
      last_name:      reg.last_name      || '',
      email:          reg.email          || '',
      age:            reg.age            || '',
      sex:            reg.sex            || 'Male',
      phone_number:   reg.phone_number   || '',
      education_level:reg.education_level|| '',
      state:          reg.state          || '',
      zone:           reg.zone           || '',
      woreda:         reg.woreda         || '',
      city:           reg.city           || '',
      kebele:         reg.kebele         || '',
      driving_license_level: reg.driving_license_level || '',
      school_branch:  reg.school_branch_id || '',
      emergency_contact_name:  reg.emergency_contact_name  || '',
      emergency_contact_phone: reg.emergency_contact_phone || '',
      // file fields: leave null; user must re-upload if they want to change
      national_id: null,
      educational_certificate: null,
      medical_report: null,
      user_image: null
    });
  } catch (err) {
    console.error('Failed to load existing registration:', err);
  }
};


 const handleEnrollSubmit = async (data) => {
  setLoading(true);
  setError(null);

  try {
    // 1. Auth
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    // 2. Build FormData payload
    const form = new FormData();
    form.append('first_name', data.first_name);
    form.append('middle_name', data.middle_name);
    form.append('last_name', data.last_name);
    form.append('email', data.email);
    form.append('age', data.age);
    form.append('sex', data.sex);
    form.append('phone_number', data.phone_number);
    form.append('education_level', data.education_level);
    form.append('state', data.state);
    form.append('zone', data.zone);
    form.append('woreda', data.woreda);
    form.append('city', data.city);
    form.append('kebele', data.kebele);
    form.append('driving_license_level', data.driving_license_level);
    form.append('school_branch', data.school_branch);
    form.append('emergency_contact_name', data.emergency_contact_name);
    form.append('emergency_contact_phone', data.emergency_contact_phone);

    // Files
    form.append('national_id', data.national_id);
    form.append('educational_certificate', data.educational_certificate);
    form.append('medical_report', data.medical_report);
    form.append('user_image', data.user_image);

    // Course ID
    form.append('course_id', course.id);

    // 3. Decide between POST vs PUT
    const existing = JSON.parse(localStorage.getItem(ENROLLMENT_KEY));
    const docStatus = localStorage.getItem(DOC_STATUS_KEY);

    let response;
    if (docStatus === 'rejected' && existing?.id) {
      // Resubmit the existing registration
      response = await apiClient.put(
        `/register/${existing.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // First-time submit or status not rejected
      response = await apiClient.post(
        '/register/create',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // 4. Persist returned enrollment object & update status
    const enrollment = response.data;
    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollment));
    localStorage.setItem(DOC_STATUS_KEY, 'submitted');

    // 5. Notify & close
    showUserToast('Enrollment submitted successfully!', 'success');
    setShowEnrollModal(false);

  } catch (err) {
    console.error('Enrollment error payload:', err.response?.data || err);
    const msg = err.response?.data?.message || err.message || 'Failed to submit enrollment';
    showUserToast(msg, 'danger');
    setError(msg);
  } finally {
    setLoading(false);
  }
};

    
  const renderEnrollButton = () => {
    if (course.enrollment_status === 'pending') {
      return (
        <Button variant="outline-secondary" disabled>
          Enrollment Pending
        </Button>
      );
    }
    
    if (course.enrollment_status === 'accepted') {
      return (
        <Button 
          variant="primary"
          onClick={() => navigate(`/courses/${course.id}/lessons`)}
        >
          Go to Course
        </Button>
      );
    }
    
    return (
      <Button 
        variant="outline-success" 
        onClick={handleEnrollClick} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Enroll'}
      </Button>
    );
  };
const DocumentStatusModal = () => (
  <Modal
    show={showDocumentStatusModal}
    onHide={() => setShowDocumentStatusModal(false)}
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>Document Status</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Alert variant="info">{documentStatusMessage}</Alert>
    </Modal.Body>

    <Modal.Footer>
      {localStorage.getItem(DOC_STATUS_KEY) === 'rejected' && (
  // inside DocumentStatusModal’s footer
<Button
  variant="primary"
  onClick={async () => {
    setShowDocumentStatusModal(false);
    await loadExistingRegistration();  // fetch & prefill formData
    setShowEnrollModal(true);          // now open the modal with data
  }}
>
  Resubmit Documents
</Button>

      )}
      <Button
        variant="secondary"
        onClick={() => setShowDocumentStatusModal(false)}
      >
        {localStorage.getItem(DOC_STATUS_KEY) === 'rejected'
          ? 'Cancel'
          : 'Close'}
      </Button>
    </Modal.Footer>
  </Modal>
);

    return (
      <>
        <div className="card mb-4" style={{ 
          width: '23rem', 
          border: 'none', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          ':hover': {
            transform: 'scale(1.02)'
          }
        }}>
          <img
            src={course.image_url || '/placeholder-course.jpg'}
            className="card-img-top"
            alt={course.title}
            style={{ height: '180px', objectFit: 'cover' }}
          />
          <div className="card-body">
            <h5 className="card-title" style={{ color: '#1E90FF' }}>{course.title}</h5>
            <p className="card-text text-muted">
              {course.description.substring(0, 80)}...
            </p>

            <div className="d-flex justify-content-between align-items-center">
              <span className="h5">{course.price} Birr</span>
              {!isMyCourse ? (
                <>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => onShowDescription(course)}
                    style={{ marginRight: '8px' }}
                  >
                    Description
                  </Button>
                  {renderEnrollButton()}
                </>
              ) : (
                renderEnrollButton()
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
    <EnrollmentModal
    show={showEnrollModal}
    onHide={() => setShowEnrollModal(false)}
    loading={loading}
    // error={errorMsg}
    successMsg={successMsg}
    formData={formData}
    handleChange={handleChange}
    handleFileChange={handleFileChange}
    fileInputRefs={fileInputRefs}
    handleSubmit={handleEnrollSubmit}   // ← point at the updated function
    course={course}
  />


        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          enrollmentId={currentEnrollmentId}
          courseId={course.id}
          amount={course.price || 500}
          onPaymentSubmit={handlePaymentSubmit}
        />

        <CancelModal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          loading={loading}
          handleCancel={handleCancelEnrollment}
          course={course}
        />

        <PendingModal
          show={successMsg && !docSubmitted}
          onClose={() => setSuccessMsg('')}
        />

        <DocumentStatusModal />

        {/* Toast Notifications */}
        <ToastContainer 
          position="top-end"
          className="p-3"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '350px'
          }}
        >
          <Toast 
            onClose={() => setShowToast(false)} 
            show={showToast} 
            delay={5000} 
            autohide
            bg={toastVariant.toLowerCase()}
          >
            <Toast.Header>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    );
  };

  CourseCard.propTypes = {
    course: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      image_url: PropTypes.string,
      enrollment_status: PropTypes.oneOf(['pending', 'accepted', 'null', null]),
      enrolled: PropTypes.bool
    }).isRequired,
    type: PropTypes.oneOf(['openEnrollment', 'myCourses']),
    onShowDescription: PropTypes.func,
    refreshDatabase: PropTypes.func
  };

  CourseCard.defaultProps = {
    type: 'openEnrollment',
    onShowDescription: () => {},
    refreshDatabase: () => {}
  };

  export default CourseCard;