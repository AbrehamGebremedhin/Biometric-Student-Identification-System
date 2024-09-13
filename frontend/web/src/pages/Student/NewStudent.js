import React, { useState } from 'react';
import Sidebar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { getCookieValue } from '../../utils/getCookieValue';
import { errorHandler } from '../../utils/errorHandler';

const NewStudent = () => {
  const [formData, setFormData] = useState({
    STUDENT_ID: '',
    firstName: '',
    fatherName: '',
    grandfatherName: '',
    STUDENT_BATCH: '',
    left_image: null,
    right_image: null,
    front_image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    const STUDENT_NAME = `${formData.firstName} ${formData.fatherName} ${formData.grandfatherName}`;
    data.append('STUDENT_ID', formData.STUDENT_ID);
    data.append('STUDENT_NAME', STUDENT_NAME);
    data.append('STUDENT_BATCH', formData.STUDENT_BATCH);
    data.append('left_image', formData.left_image);
    data.append('right_image', formData.right_image);
    data.append('front_image', formData.front_image);

    fetch('http://127.0.0.1:8000/api/v1/students/', {
        headers: {
            'Authorization': `Bearer ${getCookieValue('token')}` // Add this if you have a token
        },
      method: 'POST',
      body: data,
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        navigate('/student');
      })
      .catch((error) => {
        setLoading(false);
        setError(errorHandler(error, navigate)); // Use custom error handler
      });
  };


  return (
    <div>
        <Sidebar />
        <div className="flex-1 p-6 ml-64">
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">New Student</h1>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">Student ID:</label>
                        <input
                            type="text"
                            name="STUDENT_ID"
                            value={formData.STUDENT_ID}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">Father Name:</label>
                        <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">Grandfather Name:</label>
                        <input
                            type="text"
                            name="grandfatherName"
                            value={formData.grandfatherName}
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
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    </div>
  );
};

export default NewStudent;