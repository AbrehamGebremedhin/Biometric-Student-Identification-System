import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/SideBar';
import { useNavigate, useParams } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';

const EditStudent = () => {
  const [student, setStudent] = useState({
    STUDENT_NAME: '',
    STUDENT_EMAIL: '',
    STUDENT_AGE: ''
  });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { studentId } = useParams();

  useEffect(() => {
    // Fetch the student data from an API or other source and update the state
    axios.get(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
      .then(response => {
        setStudent({
          STUDENT_NAME: response.data.STUDENT_NAME || '',
          STUDENT_EMAIL: response.data.STUDENT_EMAIL || '',
          STUDENT_AGE: response.data.STUDENT_AGE || ''
        });
      })
      .catch(error => {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
      });
  }, [studentId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prevStudent => ({
      ...prevStudent,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send updated student data to the backend using PATCH
    axios.patch(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, student, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
      .then(response => {
        alert('Student updated successfully');
        navigate('/student');
      })
      .catch(error => {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
      });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Student</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Student Name:</label>
            <input
              type="text"
              name="STUDENT_NAME"
              value={student.STUDENT_NAME}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Student Email:</label>
            <input
              type="email"
              name="STUDENT_EMAIL"
              value={student.STUDENT_EMAIL}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Student Age:</label>
            <input
              type="number"
              name="STUDENT_AGE"
              value={student.STUDENT_AGE}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Student
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;