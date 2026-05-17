import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Tag, ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseApi';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      // Handle the case where the API might return an object like { data: [...] } or just [...]
      const coursesData = Array.isArray(data) ? data : (data.data || []);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
          Course Hub
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Master new skills with our professional, industry-aligned courses.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10 max-w-xl mx-auto relative"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500 backdrop-blur-sm"
          />
        </div>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl text-gray-300 font-medium">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col h-full backdrop-blur-sm"
            >
              {/* Course Image */}
              <div className="relative h-48 overflow-hidden bg-gray-800">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <BookOpen className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">{course.category || 'General'}</span>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours || 0} hrs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.level || 'Beginner'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-green-400">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </span>
                  <button
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors border border-white/10"
                  >
                    <span className="text-sm font-medium">View Course</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
