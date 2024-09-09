import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import axios from 'axios';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    STUDENT_ID: '',
    STUDENT_NAME: '',
    STUDENT_BATCH: '',
    left_image: null,
    right_image: null,
    front_image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/students/${id}/`, {
          headers: {
            'Authorization': `Bearer ${getCookieValue('token')}`
          }
        });
        const student = response.data;
        setFormData({
          STUDENT_ID: student.STUDENT_ID,
          STUDENT_NAME: student.STUDENT_NAME,
          STUDENT_BATCH: student.STUDENT_BATCH,
          left_image: null,
          right_image: null,
          front_image: null,
        });
      } catch (error) {
        console.error('Error fetching student:', error);
      }
    };
    fetchStudent();
  }, [id]);

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

    fetch(`http://127.0.0.1:8000/api/v1/students/${id}/`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue('token')}`
      },
      method: 'PATCH',
      body: data,
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error); // Set error message from response
        } else {
          console.log('Success:', data);
          setError(''); // Clear any previous errors
          navigate('/student'); // Redirect to students list
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error:', error);
        setError('An error occurred while submitting the form. Please try again.');
      });
  };

  return (
    <div>
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Edit Student</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {error && <div className="error text-red-500">{error}</div>}
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
            <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            {loading && <div className="spinner"></div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;