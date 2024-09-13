import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/SideBar'; // Assuming you have a utility function to get the cookie value
import { useNavigate, useParams } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';

const EditExam = () => {
  const [exam, setExam] = useState({
    EXAM_DATE: '',
    EXAM_TIME: '',
    EXAM_DURATION: ''
  });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { examId } = useParams();

  useEffect(() => {
    // Fetch the exam data from an API or other source and update the state
    axios.get(`http://127.0.0.1:8000/api/v1/exams/${examId}/`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
      .then(response => {
        setExam({
          EXAM_DATE: response.data.EXAM_DATE || '',
          EXAM_TIME: response.data.EXAM_TIME || '',
          EXAM_DURATION: response.data.EXAM_DURATION || ''
        });
      })
      .catch(error => {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
      });
  }, [examId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExam(prevExam => ({
      ...prevExam,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send updated exam data to the backend using PATCH
    axios.patch(`http://127.0.0.1:8000/api/v1/exams/${examId}/`, exam, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
      .then(response => {
        alert('Exam updated successfully');
        navigate('/exam');
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
        <h2 className="text-2xl font-bold mb-6 text-center">Update Exam</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Exam Date:</label>
            <input
              type="date"
              name="EXAM_DATE"
              value={exam.EXAM_DATE}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Exam Time:</label>
            <input
              type="time"
              name="EXAM_TIME"
              value={exam.EXAM_TIME}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Duration (minutes):</label>
            <input
              type="number"
              name="EXAM_DURATION"
              value={exam.EXAM_DURATION}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Exam
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExam;