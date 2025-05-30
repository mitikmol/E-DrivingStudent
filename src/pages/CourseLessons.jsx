import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  ListGroup,
  Button,
  Spinner,
  Alert,
  Card,
  Badge,
  Tab,
  Tabs,
  Form,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import { ThemeProvider, ThemeContext } from '../context/ThemeContext';
import {
  getCourseProgressDetails,
  getCourseProgressSummary,
} from '../services/enrollmentService';
import { apiClient } from '../services/enrollmentService';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import VideoCallButton from '../components/VideoCallButton';
import VideoCallModal from '../components/VideoCallModal';
import Avatar from '../components/Avatar';
import { firestore } from "../firebase";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";

const CourseLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  // Lesson and progress state
  const [lessons, setLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState({
    totalLessons: 0,
    completedLessons: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');

  // Messaging state
  const [students, setStudents] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [incoming, setIncoming] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [callDirection, setCallDirection] = useState(null);

  // Scroll behavior state
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const ringAudioRef = useRef(new Audio("/ringtone.mp3"));

  // User context
  const storedUserId = parseInt(localStorage.getItem('userId'), 10);
  const role = localStorage.getItem('role');
  const isTeacher = role === 'teacher';
  const [teacherId, setTeacherId] = useState(null);
  const [studentId, setStudentId] = useState(null);

  // Scroll handling
  const checkIfAtBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
    }
  }, []);

  const scrollToBottomIfNeeded = useCallback(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAtBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomIfNeeded();
    }
  }, [messages, scrollToBottomIfNeeded]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      setTimeout(scrollToBottomIfNeeded, 100);
    }
  }, [activeTab, scrollToBottomIfNeeded]);

  // Audio setup
  useEffect(() => {
    ringAudioRef.current.loop = true;
    return () => {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    };
  }, []);

  // Socket initialization
  useEffect(() => {
    const userId = storedUserId;
    socketRef.current = connectSocket(userId);

    return () => {
      disconnectSocket();
    };
  }, [storedUserId]);

  // Socket message handler
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      const isRelevant = isTeacher
        ? message.student_id === chatPartner?.id && message.teacher_id === storedUserId
        : message.teacher_id === teacherId && message.student_id === storedUserId;

      if (isRelevant) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [isTeacher, teacherId, chatPartner?.id, storedUserId]);

  // Video call handlers
  const handleStartCall = () => {
    const myId = storedUserId;
    const otherId = chatPartner.id;
    const generatedRoomId = [myId, otherId].sort().join('_');
    setRoomId(generatedRoomId);
    setIsCalling(true);
    setCallDirection('outgoing');
  };

  const acceptCall = () => {
    ringAudioRef.current.pause();
    ringAudioRef.current.currentTime = 0;
    const myId = storedUserId;
    const otherId = chatPartner.id;
    setRoomId([myId, otherId].sort().join("_"));
    setIsCalling(true);
    setIncoming(false);
    setCallDirection('incoming');
  };

  const handleEndCall = async () => {
    try {
      if (roomId) {
        await deleteDoc(doc(firestore, "video_calls", roomId));
      }
    } catch (err) {
      console.error("Error cleaning up call document:", err);
    }
    setIsCalling(false);
    setRoomId(null);
    setCallStatus(null);
    setCallDirection(null);
  };

  // Incoming call listener
  useEffect(() => {
    if (!chatPartner || isCalling || incoming) return;

    const newRoom = [storedUserId, chatPartner.id].sort().join('_');
    const roomDoc = doc(firestore, "video_calls", newRoom);
    const unsub = onSnapshot(roomDoc, (snap) => {
      const data = snap.data() || {};
      if (data.offer && !snap.metadata.hasPendingWrites) {
        setIncoming(true);
        ringAudioRef.current.play();
      }
    });

    return () => {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      unsub();
    };
  }, [chatPartner, storedUserId, isCalling, incoming]);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [lessonsRes, detailRes, summaryRes] = await Promise.all([
        apiClient.get(`/lessons/course/${courseId}`),
        getCourseProgressDetails(courseId),
        getCourseProgressSummary(courseId),
      ]);

      const lessonList = lessonsRes.data;
      const detailData = detailRes.data;
      const { totalLessons, completedLessons } = summaryRes.data;

      const withStatus = lessonList.map((lesson) => {
        const prog = detailData.find((d) => d.lesson_id === lesson.id);
        return { ...lesson, completed: Boolean(prog && prog.is_completed) };
      });

      setLessons(withStatus);
      setCourseProgress({ totalLessons, completedLessons });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Participant management
  const fetchParticipants = useCallback(async () => {
    try {
      if (isTeacher) {
        const res = await apiClient.get('/assignments/student');
        setStudents(res.data);
      } else {
        const res = await apiClient.get('/assignments/teacher');
        const teacher = res.data.teacher[0];
        if (teacher) {
          setTeacherId(teacher.id);
          setChatPartner(teacher);
        }
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  }, [isTeacher]);

  // Message management
  const fetchConversation = useCallback(async () => {
    if ((isTeacher && !chatPartner) || (!isTeacher && !teacherId)) return;

    try {
      const query = isTeacher
        ? `studentId=${chatPartner?.id}&teacherId=${storedUserId}`
        : `teacherId=${teacherId}&studentId=${storedUserId}`;
      
      const res = await apiClient.get(`/message?${query}`);
      setMessages(res.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [isTeacher, chatPartner, teacherId, storedUserId]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      fetchParticipants();
      fetchConversation();
    }
  }, [activeTab, fetchParticipants, fetchConversation]);

  // Message sending
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        teacherId: isTeacher ? storedUserId : teacherId,
        studentId: isTeacher ? chatPartner?.id : storedUserId,
        content: newMessage,
        type: 'text'
      };

      const res = await apiClient.post('/message/create', messageData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');

      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', res.data);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Assignment management
  const sendAssignment = async () => {
    if (!assignmentMessage.trim() || !chatPartner) return;
    
    try {
      await apiClient.post('/assignments/create', {
        student_id: chatPartner.id,
        course_id: courseId,
        message: assignmentMessage,
        status: 'pending',
      });
      setAssignmentMessage('');
      setShowStudentsModal(false);
    } catch (err) {
      console.error('Failed to send assignment:', err);
    }
  };

  // UI Helpers
  const progressPercent = courseProgress.totalLessons > 0
    ? Math.round((courseProgress.completedLessons / courseProgress.totalLessons) * 100)
    : 0;

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'dark'} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className={`my-5 ${theme === 'dark' ? 'text-white' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Course Content</h2>
        <div>
          {isTeacher && (
            <Button variant="outline-secondary" className="me-2" 
              onClick={() => { fetchParticipants(); setShowStudentsModal(true); }}>
              Assign Students
            </Button>
          )}
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <strong>Progress:</strong>
        <ProgressBar 
          now={progressPercent} 
          label={`${courseProgress.completedLessons} / ${courseProgress.totalLessons}`}
          className="mt-2" 
          variant={theme === 'dark' ? 'info' : 'primary'}
          style={{ height: '24px' }} 
        />
      </div>

      <Tabs 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)} 
        id="course-tabs"
        variant={theme === 'dark' ? 'dark' : 'tabs'}
        className={theme === 'dark' ? 'bg-dark' : ''}
      >
        <Tab eventKey="lessons" title="Lessons" className="pt-3">
          {lessons.length === 0 ? (
            <Card className={`text-center py-4 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
              <Card.Body>
                <Card.Text className="text-muted">No lessons yet.</Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <ListGroup variant={theme === 'dark' ? 'dark' : 'flush'}>
              {lessons.sort((a, b) => a.position - b.position).map((lesson) => (
                <ListGroup.Item
                  key={lesson.id}
                  as={Link}
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  className={`d-flex justify-content-between align-items-center py-3 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                  style={{ 
                    backgroundColor: lesson.completed 
                      ? theme === 'dark' 
                        ? '#1a2e1a' 
                        : '#f0fff0' 
                      : undefined 
                  }}
                >
                  <div>
                    <h5 className="mb-1">
                      {lesson.title}
                      {lesson.completed && <Badge bg="success" className="ms-2">Completed</Badge>}
                    </h5>
                    <p className={`mb-0 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>{lesson.content}</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="primary" pill>Lesson {lesson.position}</Badge>
                    {lesson.completed && <i className="bi bi-check-circle-fill text-success fs-5"></i>}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="discussion" title="Messages" className="pt-3">
          <Card className={`border-0 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : 'shadow-sm'}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                  {isTeacher ? 'Student Communication' : 'Chat with Teacher'}
                </h4>
                {chatPartner && (
                  <VideoCallButton onStart={handleStartCall} />
                )}
              </div>

              {!chatPartner ? (
                <div className={`text-center py-4 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>
                  {isTeacher ? (
                    <>
                      <p className="mb-3">Select a student to start chatting</p>
                      <Button
                        variant="primary"
                        onClick={() => {
                          fetchParticipants();
                          setShowStudentsModal(true);
                        }}
                      >
                        Choose Student
                      </Button>
                    </>
                  ) : (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Loading teacher information...</span>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className={`mb-3 p-3 rounded d-flex align-items-center gap-3 ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-light'}`}>
                    <Avatar
                      src={chatPartner.profile_picture}
                      name={`${chatPartner.first_name} ${chatPartner.last_name}`}
                      size="48px"
                    />
                    <div>
                      <h5 className="mb-0">
                        {chatPartner.first_name} {chatPartner.last_name}
                      </h5>
                      <small className={theme === 'dark' ? 'text-light' : 'text-muted'}>
                        {isTeacher ? 'Student' : 'Instructor'}
                      </small>
                    </div>
                  </div>

                  <div
                    ref={messagesContainerRef}
                    onScroll={checkIfAtBottom}
                    className={`chat-messages mb-4 p-3 rounded ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`}
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className={`text-center py-4 m-auto ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>
                        No messages yet. Start the conversation!
                      </div>
                    ) : messages.map(msg => {
                      const isSender = (isTeacher && msg.sent_by === 'teacher') ||
                                      (!isTeacher && msg.sent_by === 'student');
                      return (
                        <div
                          key={msg.id}
                          className={`d-flex ${isSender ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div
                            className={`p-3 rounded ${
                              isSender
                                ? 'bg-primary text-white'
                                : theme === 'dark'
                                  ? 'bg-dark text-white border-secondary'
                                  : 'bg-white border'
                            }`}
                            style={{
                              maxWidth: '75%',
                              borderRadius: isSender
                                ? '18px 4px 18px 18px'
                                : '4px 18px 18px 18px',
                              wordBreak: 'break-word'
                            }}
                          >
                            <div className="mb-1">{msg.content}</div>
                            <div className={`small mt-1 ${
                              isSender
                                ? (theme === 'dark' ? 'text-light' : 'text-white-50')
                                : (theme === 'dark' ? 'text-light' : 'text-muted')
                            } ${isSender ? 'text-end' : 'text-start'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <Form className="message-input">
                    <Form.Group className="d-flex gap-2 mb-0">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        style={{ resize: 'none' }}
                        className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}
                      />
                      <Button
                        variant="primary"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4"
                      >
                        Send
                      </Button>
                    </Form.Group>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Modal 
        show={showStudentsModal} 
        onHide={() => setShowStudentsModal(false)} 
        size="lg"
        contentClassName={theme === 'dark' ? 'bg-dark text-white' : ''}
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Modal.Title>{chatPartner ? 'Create Assignment' : 'Select Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
          {chatPartner ? (
            <>
              <Form.Group className="mb-4">
                <Form.Label>Assignment Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={assignmentMessage}
                  onChange={(e) => setAssignmentMessage(e.target.value)}
                  placeholder="Enter detailed instructions for the assignment..."
                  className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setChatPartner(null)}>
                  Back
                </Button>
                <Button variant="primary" onClick={sendAssignment}>
                  Send Assignment
                </Button>
              </div>
            </>
          ) : (
            <>
              {students.length === 0 ? (
                <div className={`text-center py-4 ${theme === 'dark' ? 'text-light' : ''}`}>
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Loading available students...</span>
                </div>
              ) : (
                <ListGroup variant={theme === 'dark' ? 'dark' : 'flush'}>
                  {students.map((student) => (
                    <ListGroup.Item
                      key={student.id}
                      action
                      onClick={() => {
                        setChatPartner(student);
                        setStudentId(student.id);
                      }}
                      className={`d-flex align-items-center gap-3 py-3 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                    >
                      <Avatar 
                        src={student.profile_picture} 
                        name={`${student.first_name} ${student.last_name}`}
                      />
                      <div>
                        <h6 className="mb-0">
                          {student.first_name} {student.last_name}
                        </h6>
                        <small className={theme === 'dark' ? 'text-light' : 'text-muted'}>{student.email}</small>
                      </div>
                      <Badge bg={student.is_verified ? 'success' : 'warning'} className="ms-auto">
                        {student.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {incoming && (
        <Modal show={incoming} onHide={() => {
          ringAudioRef.current.pause();
          ringAudioRef.current.currentTime = 0;
          setIncoming(false);
        }} centered>
          <Modal.Header closeButton>
            <Modal.Title>Incoming Video Call</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>Call from {chatPartner?.first_name} {chatPartner?.last_name}</p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="danger" onClick={() => {
                ringAudioRef.current.pause();
                ringAudioRef.current.currentTime = 0;
                setIncoming(false);
              }}>
                Decline
              </Button>
              <Button variant="success" onClick={acceptCall}>
                Accept
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {isCalling && (
        <VideoCallModal
          roomId={roomId}
          onClose={handleEndCall}  
          chatPartner={chatPartner}
          callStatus={callStatus}
          setCallStatus={setCallStatus}
        />
      )}
    </Container>
  );
};

export default function CourseLessonsPageWrapper(props) {
  return (
    <ThemeProvider>
      <CourseLessonsPage {...props} />
    </ThemeProvider>
  );
}