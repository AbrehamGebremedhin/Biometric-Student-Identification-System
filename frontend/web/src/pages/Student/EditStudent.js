import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';
import Sidebar from '../../components/SideBar';

const EditStudent = () => {
  const [formData, setFormData] = useState({
    STUDENT_ID: '',
    STUDENT_NAME: '',
    STUDENT_BATCH: '',
    left_image: null,
    right_image: null,
    front_image: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { studentId } = useParams();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
    .then(response => {
      const student = response.data;
      setFormData({
        STUDENT_ID: student.STUDENT_ID,
        STUDENT_NAME: student.STUDENT_NAME,
        STUDENT_BATCH: student.STUDENT_BATCH,
        left_image: null,
        right_image: null,
        front_image: null,
      });
    })
    .catch(error => {
      const errorMessage = errorHandler(error, navigate);
      setErrorMessage(errorMessage);
    });
  }, [studentId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prevState => ({
        ...prevState,
        [name]: files[0]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('STUDENT_ID', formData.STUDENT_ID);
    data.append('STUDENT_NAME', formData.STUDENT_NAME);
    data.append('STUDENT_BATCH', formData.STUDENT_BATCH);
    if (formData.left_image) data.append('left_image', formData.left_image);
    if (formData.right_image) data.append('right_image', formData.right_image);
    if (formData.front_image) data.append('front_image', formData.front_image);

    axios.patch(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getCookieValue("token")}`
      }
    })
    .then(response => {
      alert('Student updated successfully!');
      navigate('/student');
    })
    .catch(error => {
      setLoading(false);
      const errorMessage = errorHandler(error, navigate);
      setErrorMessage(errorMessage);
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Edit Student</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Student ID:</label>
              <input
                type="text"
                name="STUDENT_ID"
                value={formData.STUDENT_ID}
                onChange={handleChange}
                className="border p-2 rounded"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Student Name:</label>
              <input
                type="text"
                name="STUDENT_NAME"
                value={formData.STUDENT_NAME}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Student Batch:</label>
              <input
                type="text"
                name="STUDENT_BATCH"
                value={formData.STUDENT_BATCH}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Left Image:</label>
              <input
                type="file"
                name="left_image"
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Right Image:</label>
              <input
                type="file"
                name="right_image"
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Front Image:</label>
              <input
                type="file"
                name="front_image"
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;