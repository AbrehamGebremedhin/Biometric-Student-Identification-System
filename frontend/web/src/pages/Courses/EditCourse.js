import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom';

const EditCourse = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState({
    COURSE_CODE: '',
    COURSE_NAME: '',
    TERM: ''
  });
  const navigate = useNavigate();


  const getCookieValue = (cookieName) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(cookieName + '=')) {
        return cookie.substring(cookieName.length + 1);
      }
    }
    return null; // Cookie not found
  };

  useEffect(() => {
    // Fetch course data from the backend
    axios.get(`http://127.0.0.1:8000/api/v1/courses/${courseId}/`,{
        headers: {
          'Authorization': `Bearer ${getCookieValue("token")}`
        }
        })
      .then(response => {
        setCourse(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the course data!', error);
      });
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prevCourse => ({
      ...prevCourse,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send updated course data to the backend using PATCH
    axios.patch(`http://127.0.0.1:8000/api/v1/courses/${courseId}/`, course, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
    }
        
    )
      .then(response => {
        alert('Course updated successfully!');
        navigate('/course');
      })
      .catch(error => {
        console.error('There was an error updating the course!', error);
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
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;