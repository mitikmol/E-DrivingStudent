import axios from 'axios';
import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EnrollmentPage = ({ courseId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    age: '',
    sex: 'Male',
    education_level: '',
    state: '',
    zone: '',
    woreda: '',
    city: '',
    kebele: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    driving_license_level: '',
    school_branch: 'main'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://driving-backend-stmb.onrender.com/api/register/create',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        setTimeout(() => navigate('/courses'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="success">
          <h4>Enrollment Successful!</h4>
          <p>Your application has been submitted. You'll be notified once approved.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: '800px' }}>
      <h2 className="mb-4 text-center">Course Enrollment Form</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="mx-auto">
        {/* Personal Information */}
        <h5 className="mb-3 text-center">Personal Information</h5>
        <Row className="justify-content-center">
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Age *</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Gender *</Form.Label>
              <Form.Select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Contact Information */}
        <h5 className="mb-3 mt-4 text-center">Contact Information</h5>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Education Level *</Form.Label>
              <Form.Select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                required
              >
                <option value="">Select education level</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Diploma">Diploma</option>
                <option value="Degree">Degree</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Address Information */}
        <h5 className="mb-3 mt-4 text-center">Address Information</h5>
        <Row className="justify-content-center">
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>State *</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Zone *</Form.Label>
              <Form.Control
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Woreda *</Form.Label>
              <Form.Control
                type="text"
                name="woreda"
                value={formData.woreda}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City *</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kebele *</Form.Label>
              <Form.Control
                type="text"
                name="kebele"
                value={formData.kebele}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Emergency Contact */}
        <h5 className="mb-3 mt-4 text-center">Emergency Contact</h5>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Emergency Contact Name *</Form.Label>
              <Form.Control
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Emergency Contact Phone *</Form.Label>
              <Form.Control
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Driving Information */}
        <h5 className="mb-3 mt-4 text-center">Driving Information</h5>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Driving License Level *</Form.Label>
              <Form.Select
                name="driving_license_level"
                value={formData.driving_license_level}
                onChange={handleChange}
                required
              >
               <option value="Motorcycle driver’s qualification certification permit">Motorcycle </option>
<option value="Automobile driver’s qualification certification permit">Automobile </option>
<option value="Taxi driver’s qualification certification permit - Category T1">Taxi Category T1</option>
<option value="Taxi driver’s qualification certification permit - Category T2">Taxi Category T2</option>
<option value="Public transport vehicles driver’s qualification certification permit - Category P1">Public transport Category P1</option>
<option value="Public transport vehicles driver’s qualification certification permit - Category P2">Public transport Category P2</option>
<option value="Truck driver’s qualification certification permit - Category D1">Truck Category D1</option>
<option value="Truck driver’s qualification certification permit - Category D2">Truck Category D2</option>
<option value="Truck driver’s qualification certification permit - Category D3">Truck Category D3</option>
<option value="Tanker driver’s qualification certification permit - Category F1">Tanker Category F1</option>
<option value="Tanker driver’s qualification certification permit - Category F2">Tanker Category F2</option>
<option value="Special mobile equipment driver’s qualification certification permit - Category S1">Special mobile equipment  Category S1</option>
<option value="Special mobile equipment driver’s qualification certification permit - Category S2">Special mobile equipment Category S2</option>
<option value="Special mobile equipment driver’s qualification certification permit - Category S3">Special mobile equipment Category S3</option>

              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
          <Form.Group className="mb-3">
  <Form.Label>School Branch *</Form.Label>
  <Form.Select
    name="school_branch"
    value={formData.school_branch}
    onChange={handleChange}
    required
  >
    <option value="">Select a city</option>
    <option value="3139ca56-3608-4b28-9066-da8adbddd4e5">Addis Ababa</option>
    <option value="b8a53cce-7acd-45ed-a654-9898cc9f2c6f">Hawassa</option>
    <option value="c15059d6-5624-4213-b9e6-5e0de5b48556">Adama</option>
    <option value="261a66ce-4421-43d8-a7c9-b2ff929715ed">Bahir Dar</option>
    <option value="9a47aba6-71ff-49c4-9939-d42870bc0469">Dire Dawa</option>
    <option value="39038bd1-a0de-435d-9768-3a100b58a0d5">Mekelle</option>
    <option value="838d99c5-4f88-4c88-94e2-9167e8d68ca0">Gondar</option>
    <option value="8940b639-6dc4-46eb-8144-2f1b0065e5ee">Jimma</option>
    <option value="79bfa1f3-0a03-485f-8a3c-e163ced1e183">Jijiga</option>
  </Form.Select>
</Form.Group>

          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            size="lg"
            style={{ width: '200px' }}
          >
            {loading ? 'Submitting...' : 'Submit Enrollment'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EnrollmentPage;