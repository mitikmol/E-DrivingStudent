import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Badge,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import { apiClient } from '../services/enrollmentService';
import {
  getCourseProgressSummary,
  getLessonProgress,
  completeLesson,
} from '../services/enrollmentService';
// import { Modal } from 'react-bootstrap';

import '../styles/LessonDocument.css';
import LessonDocument from '../components/LessonDocument';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);


  const [courseProgress, setCourseProgress] = useState({
    totalLessons: 0,
    completedLessons: 0,
  });
  const [forceUpdate, setForceUpdate] = useState(0);

  // 1) Fetch lesson data + quizzes + progress summary
  useEffect(() => {
    const fetchData = async () => {
      // reset previous quiz state on lesson change:
      setSubmitted(false);
      setSubmittedAnswers({});
      setSubmissionResult(null);
      setSelectedOptions({});
      setIsLessonCompleted(false);

      try {
        setLoading(true);
        // all lessons
        const lessonsRes = await apiClient.get(`/lessons/course/${courseId}`);
        setLessons(lessonsRes.data);

        // this lesson
        const currentLesson = lessonsRes.data.find(l => l.id.toString() === lessonId);
        if (!currentLesson) throw new Error('Lesson not found');
        setLesson(currentLesson);

        // quizzes (if any)
        try {
          const quizRes = await apiClient.get(`/quizzes/${lessonId}`);
          setQuizzes(quizRes.data);
          const initSelected = {};
          quizRes.data.forEach(q => {
            initSelected[q.id] = null;
          });
          setSelectedOptions(initSelected);
        } catch {
          setQuizzes([]);
        }

        // initial checks
        await checkLessonCompletion();
        await fetchCourseProgress();
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, courseId]);

  // 2) ALSO re-check completion any time we arrive at a new lesson
  useEffect(() => {
    checkLessonCompletion();
  }, [lessonId]);

useEffect(() => {
  const fetchTeacher = async () => {
    try {
      const res = await apiClient.get(`/assignments/teacher?courseId=${courseId}`);
      console.log('raw teacher payload', res.data.teacher);
      const t = res.data.teacher?.[0] || null;
      setTeacher(t);
    } catch (err) {
      console.error('Failed to load teacher info', err);
    }
  };
  fetchTeacher();
}, [courseId]);



  // Fetch course summary
  const fetchCourseProgress = async () => {
    try {
      setProgressLoading(true);
      const res = await apiClient.get(`/progress/course/${courseId}/summary`);
      setCourseProgress({
        totalLessons: res.data.totalLessons,
        completedLessons: res.data.completedLessons,
      });
    } catch (err) {
      console.error('Error loading course progress', err);
    } finally {
      setProgressLoading(false);
    }
  };

  // Check single lesson completion
  const checkLessonCompletion = async () => {
    try {
      setProgressLoading(true);
      const res = await apiClient.get(`/progress/lesson/${lessonId}`);
      setIsLessonCompleted(res.data.completed);
    } catch {
      setIsLessonCompleted(false);
    } finally {
      setProgressLoading(false);
    }
  };

  // Mark this lesson done
  const markLessonCompleted = async () => {
    try {
      setProgressLoading(true);
      await apiClient.post(`/progress/complete/${lessonId}`);
      setForceUpdate(f => f + 1);
      setIsLessonCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  };

  // Submit quiz answers
  const handleSubmitAll = async e => {
    e.preventDefault();
    const unanswered = quizzes.filter(q => !selectedOptions[q.id]);
    if (unanswered.length) {
      return alert(
        `Please answer all quizzes before submitting. You have ${unanswered.length} unanswered.`
      );
    }

    try {
      setSubmitting(true);
      const answers = quizzes.map(q => ({
        quiz_id: q.id,
        selected_option_id: selectedOptions[q.id],
      }));
      const res = await apiClient.post(`/quizzes/submit-batch/${lessonId}`, { answers });

      // map by quiz
      const submittedMap = {};
      res.data.answers.forEach(ans => {
        submittedMap[ans.quiz_id] = ans;
      });
      setSubmittedAnswers(submittedMap);
      setSubmissionResult(res.data);
      setSubmitted(true);

      // after quiz submit, auto-complete lesson
      await markLessonCompleted();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit quizzes');
    } finally {
      setSubmitting(false);
    }
  };

  // video ID helper
  const videoId = useMemo(() => {
    if (!lesson?.media_url) return '';
    try {
      const url = new URL(lesson.media_url);
      if (url.searchParams.has('v')) return url.searchParams.get('v') ?? '';
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    } catch {
      const parts = lesson.media_url.split('v=');
      return parts[1]?.split('&')[0] ?? '';
    }
    return '';
  }, [lesson?.media_url]);

  // media loader state
  const [mediaLoading, setMediaLoading] = useState(true);
  const renderMediaContent = () => {
    if (!lesson) return null;
    switch (lesson.media_type) {
      case 'youtube':
        return (
          <div className="mb-4 d-flex justify-content-center">
            <div style={{ width: '100%', maxWidth: '720px', aspectRatio: '16 / 9', position: 'relative' }}>
              {mediaLoading && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'var(--bs-tertiary-bg)',
                  }}
                >
                  <Spinner animation="border" role="status" className="text-primary" />
                  <p className="mt-2 text-body">Loading video content...</p>
                </div>
              )}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`}
                title={lesson.title}
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  visibility: mediaLoading ? 'hidden' : 'visible',
                }}
                onLoad={() => setMediaLoading(false)}
                onError={() => setMediaLoading(false)}
              />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="mb-4">
            {mediaLoading && (
              <div className="text-center my-5">
                <Spinner animation="border" role="status" />
                <p className="mt-2">Loading document…</p>
              </div>
            )}
            {lesson.document_content && (
              <Card className="mb-4">
                <Card.Body>
                  <LessonDocument rawHtml={lesson.document_content} />
                </Card.Body>
              </Card>
            )}
          </div>
        );
      default:
        return <p className="text-body">Unsupported media type</p>;
    }
  };

  // render
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Lesson</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Course Progress */}
      <div className="mb-4">
        <strong>Course Progress:</strong>
        <ProgressBar
          now={
            courseProgress.totalLessons > 0
              ? (courseProgress.completedLessons / courseProgress.totalLessons) * 100
              : 0
          }
          label={`${courseProgress.completedLessons} / ${courseProgress.totalLessons}`}
          className="mt-2"
        />
      </div>

      {/* Lesson Title & Badges */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{lesson.title}</h2>
        <div>
          <Badge bg="primary" className="me-2">
            Lesson {lesson.position}
          </Badge>
          {isLessonCompleted && <Badge bg="success">Completed</Badge>}
        </div>
      </div>

      {/* Document Content */}
      {lesson.document_content && (
        <Card className="mb-4">
          <Card.Body>
            <LessonDocument rawHtml={lesson.document_content} />
          </Card.Body>
        </Card>
      )}

      {/* Media */}
      {renderMediaContent()}

      {/* Quiz/Form */}
      {quizzes.length > 0 ? (
        <Form onSubmit={handleSubmitAll}>
          {quizzes.map((quiz, idx) => {
            const sub = submittedAnswers[quiz.id];
            return (
              <Card key={quiz.id} className="mb-4">
                <Card.Body>
                  <Card.Title>Quiz {idx + 1}</Card.Title>
                  <Form.Group className="mb-3">
                    <Form.Label>{quiz.question}</Form.Label>
                    {quiz.options.map(opt => (
                      <Form.Check
                        key={opt.id}
                        type="radio"
                        id={`quiz-${quiz.id}-opt-${opt.id}`}
                        name={`quiz-${quiz.id}`}
                        label={opt.option_text}
                        checked={selectedOptions[quiz.id] === opt.id}
                        onChange={() => setSelectedOptions(o => ({ ...o, [quiz.id]: opt.id }))}
                        disabled={submitted || isLessonCompleted}
                      />
                    ))}
                  </Form.Group>

                  {submitted && sub && (
                    <div className="mt-3">
                      {sub.isCorrect ? (
                        <Alert variant="success">Correct!</Alert>
                      ) : (
                        <Alert variant="danger">
                          <div>
                            <strong>Incorrect:</strong> You chose “
                            {quiz.options.find(o => o.id === sub.selected_option_id)?.option_text}”
                          </div>
                          <div className="mt-2">
                            <strong>Correct Answer:</strong> “
                            {
                              quiz.options.find(o => o.id === sub.correct_option_id)
                                ?.option_text
                            }”
                          </div>
                        </Alert>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}

          {!submitted && !isLessonCompleted && (
            <div className="text-center mt-4">
              <Button type="submit" disabled={submitting} size="lg">
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit All Answers'
                )}
              </Button>
            </div>
          )}
        </Form>
      ) : (
        // No quizzes – simple “mark complete” button
        !isLessonCompleted && (
          <div className="text-center mt-4">
            <Button onClick={markLessonCompleted} disabled={progressLoading}>
              {progressLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Marking...
                </>
              ) : (
                'Mark Lesson as Completed'
              )}
            </Button>
          </div>
        )
      )}

      {/* Quiz Summary */}
      {submitted && (
        <Alert variant="info" className="mt-4">
          <h4>Quiz Results Summary</h4>
          <p>
            You scored {submissionResult.correctAnswers} of {submissionResult.totalQuizzes}
          </p>
          {submissionResult.correctAnswers === submissionResult.totalQuizzes ? (
            <p className="text-success">Perfect score! 🎉</p>
          ) : submissionResult.correctAnswers >= submissionResult.totalQuizzes / 2 ? (
            <p>Good job—keep it up!</p>
          ) : (
            <p className="text-danger">Keep practicing to improve your score.</p>
          )}
        </Alert>
      )}

      {/* Navigation Buttons */}
{/* Navigation Buttons */}
<div className="mt-4 d-flex justify-content-between align-items-center">
  {/* Previous */}
  {lessons.length > 0 && lessons.findIndex(l => l.id.toString() === lessonId) > 0 ? (
    <Button
      variant="outline-secondary"
      onClick={() => {
        const idx = lessons.findIndex(l => l.id.toString() === lessonId);
        navigate(`/courses/${courseId}/lessons/${lessons[idx - 1].id}`);
      }}
    >
      Previous Lesson
    </Button>
  ) : (
    <div />
  )}

  {/* Back to Course */}
  <Button variant="outline-primary" onClick={() => navigate(`/courses/${courseId}/lessons`)}>
    Back to Course
  </Button>

  {/* Next or Finish */}
  {lessons.length > 0 &&
    (() => {
      const currentIdx = lessons.findIndex(l => l.id.toString() === lessonId);
      const isLastLesson = currentIdx === lessons.length - 1;

      if (isLastLesson) {
        return (
          <Button
            variant="primary"
            onClick={() => setShowCongratsModal(true)}
            disabled={!isLessonCompleted}
          >
            Finish Course
          </Button>
        );
      } else {
        return (
          <Button
            variant="primary"
            onClick={() =>
              navigate(`/courses/${courseId}/lessons/${lessons[currentIdx + 1].id}`)
            }
            disabled={!isLessonCompleted}
          >
            Next Lesson
          </Button>
        );
      }
    })()}
</div>



      <Modal
  show={showCongratsModal}
  onHide={() => setShowCongratsModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>🎉 Congratulations!</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>You’ve completed the course!</p>
    <hr />
    <h5>Field Training</h5>
    {teacher ? (
      <ul>
        <li><strong>Name:</strong> {teacher.first_name} {teacher.last_name}</li>
        <li><strong>Email:</strong> <a href={`mailto:${teacher.email}`}>{teacher.email}</a></li>
        <li>
  <strong>Phone:</strong>{' '}
  {teacher.phone_number
    ? <a href={`tel:${teacher.phone_number}`}>{teacher.phone_number}</a>
    : 'Not available'}
</li>
      </ul>
    ) : (
      <Spinner animation="border" size="sm" />
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="primary"
      onClick={() => {
        setShowCongratsModal(false);
        navigate(`/courses/${courseId}/lessons`);
      }}
    >
      Back to Course
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};

export default LessonPage;
