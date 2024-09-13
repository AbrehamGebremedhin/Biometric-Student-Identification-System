import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';

const AddExam = () => {
  const [courseCode, setCourseCode] = useState();
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [examType, setExamType] = useState('MIDTERM');
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const examData = {
      COURSE_CODE: courseCode,
      EXAM_DATE: examDate,
      EXAM_TIME: examTime,
      EXAM_DURATION: examDuration,
      EXAM_TYPE: examType
    }
    console.log(examData);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/exams/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookieValue('token')}`
        },
        body: JSON.stringify(examData)
      });
      await response.json();
      navigate('/exam');
      setError(null); // Clear any previous errors
    } catch (error) {
      setError(errorHandler(error, navigate));
    }
  };

  useEffect(() => {
    // Fetch courses from the server
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/courses/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setCourses(response.data);
      } catch (error) {
        setError(errorHandler(error, navigate));
      }
    };

    fetchCourses();
  }, [navigate]);

  return (
    <div>
      <Sidebar />
      <div className='flex-1 p-6 ml-64'>
        <div className="container mx-auto">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Add Exam</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Course Code:</label>
              <select
                name="courseCode"
                onChange={(e) => setCourseCode(e.target.value)}
                required
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.COURSE_CODE} - {course.COURSE_NAME} - {course.TERM}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Exam Date:</label>
              <input
                type="date"
                name="examDate"
                onChange={(e)=>setExamDate(e.target.value)}
                required
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Exam Time:</label>
              <input
                type="time"
                name="examTime"
                onChange={(e)=>setExamTime(e.target.value)}
                required
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Exam Duration (minutes):</label>
              <input
                type="number"
                name="examDuration"
                onChange={(e)=>setExamDuration(e.target.value)}
                required
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Exam Type:</label>
              <select
                name="examType"
                onChange={(e)=>setExamType(e.target.value)}
                required
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200">
              Add Exam
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExam;