import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import { getCookieValue } from '../../utils/getCookieValue';
import { errorHandler } from '../../utils/errorHandler';

const AddRoom = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [examTime, setExamTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleExamTimeChange = (e) => {
    setExamTime(e.target.value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (csvFile) {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('EXAM_TIME', examTime);

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/v1/rooms/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getCookieValue('token')}`
          },
          responseType: 'blob' // Important to handle binary data
        });
      
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'room_allocation.zip');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      
        navigate('/room');
      } catch (error) {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
      }
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-6 ml-64'>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Add Room</h1>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="block text-gray-700 mb-2">Upload CSV File:</label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
              />
              <label htmlFor="examTime" className="block text-gray-700 mb-2 mt-4">Exam Time:</label>
              <select 
                id="examTime" 
                name="examTime" 
                className="w-full px-3 py-2 border rounded"
                onChange={handleExamTimeChange}
              >
                <option value="">Select Exam Time</option>
                <option value="MORNING">Morning (9:00 AM)</option>
                <option value="MIDDAY">Mid-day (11:00 AM)</option>
                <option value="AFTERNOON">Afternoon (02:00 PM)</option>
              </select>
              <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;