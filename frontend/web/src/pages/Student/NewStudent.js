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
  const [errors, setErrors] = useState({});
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

  const validateInputs = () => {
    const newErrors = {};
    if (!formData.STUDENT_ID) newErrors.STUDENT_ID = 'Student ID is required.';
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.fatherName) newErrors.fatherName = 'Father\'s name is required.';
    if (!formData.grandfatherName) newErrors.grandfatherName = 'Grandfather\'s name is required.';
    if (!formData.STUDENT_BATCH) newErrors.STUDENT_BATCH = 'Student batch is required.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateInputs();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const data = new FormData();
    const STUDENT_NAME = `${formData.firstName} ${formData.fatherName} ${formData.grandfatherName}`;
    data.append('STUDENT_ID', formData.STUDENT_ID);
    data.append('STUDENT_NAME', STUDENT_NAME);
    data.append('STUDENT_BATCH', formData.STUDENT_BATCH);
    data.append('left_image', formData.left_image);
    data.append('right_image', formData.right_image);
    data.append('front_image', formData.front_image);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/students/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${getCookieValue('token')}`
        },
        body: data
      });

      if (!response.ok) {
        const res = await response.json();
        setError(res.Error || 'An error occurred');
        setLoading(false);
        return;
      }

      await response.json();
      navigate('/students');
      setError(''); // Clear any previous errors
      setLoading(false);
    } catch (error) {
      setError(errorHandler(error, navigate));
      setLoading(false);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add New Student</h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="STUDENT_ID">
                Student ID:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="STUDENT_ID"
                name="STUDENT_ID"
                value={formData.STUDENT_ID}
                onChange={handleChange}
              />
              {errors.STUDENT_ID && <p className="text-red-500 text-xs italic">{errors.STUDENT_ID}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="text-red-500 text-xs italic">{errors.firstName}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherName">
                Father's Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
              {errors.fatherName && <p className="text-red-500 text-xs italic">{errors.fatherName}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grandfatherName">
                Grandfather's Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="grandfatherName"
                name="grandfatherName"
                value={formData.grandfatherName}
                onChange={handleChange}
              />
              {errors.grandfatherName && <p className="text-red-500 text-xs italic">{errors.grandfatherName}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="STUDENT_BATCH">
                Student Batch:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="STUDENT_BATCH"
                name="STUDENT_BATCH"
                value={formData.STUDENT_BATCH}
                onChange={handleChange}
              />
              {errors.STUDENT_BATCH && <p className="text-red-500 text-xs italic">{errors.STUDENT_BATCH}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="left_image">
                Left Image:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="left_image"
                name="left_image"
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="right_image">
                Right Image:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="right_image"
                name="right_image"
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="front_image">
                Front Image:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="front_image"
                name="front_image"
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewStudent;