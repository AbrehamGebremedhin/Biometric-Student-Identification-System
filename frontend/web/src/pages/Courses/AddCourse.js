import React, { useState } from 'react';
import Sidebar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';


const AddCourse = () => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [term, setTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCourse = {
      COURSE_CODE: courseCode,
      COURSE_NAME: courseName,
      TERM: term,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/courses/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookieValue('token')}`
        },
        body: JSON.stringify(newCourse)
      });
      await response.json();
      navigate('/course');
      setError(null); // Clear any previous errors
    } catch (error) {
      const errorMessage = errorHandler(error, navigate);
      setError('Error sending message: ' + errorMessage);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add Course</h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseCode">
                Course Code:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseName">
                Course Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="term">
                Term:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;