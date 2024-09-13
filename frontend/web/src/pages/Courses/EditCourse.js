import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';
import Sidebar from '../../components/SideBar';

const EditCourse = ({ courseId }) => {
  const [course, setCourse] = useState({});
  const navigate = useNavigate();



  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/v1/courses/${courseId}/`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
    .then(response => {
      setCourse(response.data);
    })
    .catch(error => {
      const errorMessage = errorHandler(error, navigate);
      console.error('There was an error fetching the course data!', errorMessage);
    });
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prevCourse => ({
      ...prevCourse,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.patch(`http://127.0.0.1:8000/api/v1/courses/${courseId}/`, course, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
    .then(response => {
      alert('Course updated successfully!');
      navigate('/course');
    })
    .catch(error => {
      const errorMessage = errorHandler(error, navigate);
      console.error('There was an error updating the course!', errorMessage);
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Course Code:</label>
              <input
                type="text"
                name="COURSE_CODE"
                value={course.COURSE_CODE}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Course Name:</label>
              <input
                type="text"
                name="COURSE_NAME"
                value={course.COURSE_NAME}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Term:</label>
              <select
                name="TERM"
                value={course.TERM}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
                <option value="FALL">Fall</option>
                <option value="WINTER">Winter</option>
              </select>
            </div>
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">Update Course</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;