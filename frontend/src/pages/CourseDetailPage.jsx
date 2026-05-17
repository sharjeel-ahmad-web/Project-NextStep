import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, BookOpen, CheckCircle, ArrowLeft, MonitorPlay } from 'lucide-react';
import { courseService } from '../services/courseApi';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false); // Simplified enrollment state

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(id);
      // Backend might return course inside a data wrapper or directly
      setCourse(data.course || data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details.');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    setEnrolled(true);
    toast.success(`Successfully enrolled in ${course.title}!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto min-h-screen">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/courses')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Courses</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-400 text-lg">
              {course.description}
            </p>
          </motion.div>

          {/* Lessons Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <MonitorPlay className="w-6 h-6 text-blue-400" />
              <span>Course Curriculum</span>
            </h2>
            
            <div className="space-y-4">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, idx) => (
                  <div 
                    key={lesson._id || idx}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {enrolled ? (
                        <PlayCircle className="w-6 h-6 text-blue-400 cursor-pointer hover:text-blue-300 transition-colors" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{lesson.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{lesson.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500 font-medium whitespace-nowrap pt-1">
                      {lesson.duration_minutes} min
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Lessons are currently being added to this course.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar / Enrollment Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 backdrop-blur-sm shadow-xl">
            <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-800">
              {course.image_url ? (
                <img src={course.image_url} alt="Course preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                  <PlayCircle className="w-16 h-16 text-white/40" />
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-white mb-6">
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrolled}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                enrolled 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {enrolled ? (
                <span className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Enrolled</span>
                </span>
              ) : (
                'Enroll Now'
              )}
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center"><Clock className="w-4 h-4 mr-2" /> Duration</span>
                <span className="text-white font-medium">{course.duration_hours || 0} hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Level</span>
                <span className="text-white font-medium">{course.level || 'All Levels'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Certificate</span>
                <span className="text-white font-medium">Included</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
