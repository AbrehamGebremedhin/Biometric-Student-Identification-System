import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';

const ExaminerMobile = () => {
  const [examinerMobiles, setExaminerMobiles] = useState([]);
  const [filters, setFilters] = useState({
    examinerName: '',
    examinerPhone: '',
    active: ''
  });

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
    // Fetch examinerMobiles from the server
    const fetchExaminerMobiles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/examiners/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setExaminerMobiles(response.data);
      } catch (error) {
        console.error('Error fetching examinerMobiles:', error);
      }
    };
    fetchExaminerMobiles();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleDelete = (examinerMobileId) => {
    const confirmed = window.confirm('Are you sure you want to remove this Mobile Application?');
    if (confirmed) {
      axios.delete(`http://127.0.0.1:8000/api/v1/examiners/${examinerMobileId}/`, {
        headers: {
          'Authorization': `Bearer ${getCookieValue("token")}`
        }
      })
      .then(response => {
        alert('ExaminerMobile deleted successfully');
        // Remove the deleted examinerMobile from the state
        setExaminerMobiles(examinerMobiles.filter(examinerMobile => examinerMobile.id !== examinerMobileId));
      })
      .catch(error => {
        alert('Error deleting examinerMobile: ' + error.message);
      });
    }
  };

  const filteredExaminerMobiles = examinerMobiles.filter(examinerMobile => {
    return (
      (filters.examinerName === '' || examinerMobile.EXAMINER_NAME.includes(filters.examinerName)) &&
      (filters.examinerPhone === '' || examinerMobile.EXAMINER_PHONE.includes(filters.examinerPhone)) &&
      (filters.active === '' || examinerMobile.ACTIVE.toString() === filters.active)
    );
  });

  const handleToggleActivation = (id, currentStatus) => {
    const newStatus = !currentStatus;
    fetch(`/api/examinerMobiles/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active: newStatus }),
    })
      .then(response => response.json())
      .then(data => {
        setExaminerMobiles(prevState =>
          prevState.map(examinerMobile =>
            examinerMobile.id === id ? { ...examinerMobile, ACTIVE: newStatus } : examinerMobile
          )
        );
      })
      .catch(error => {
        alert('Error updating examinerMobile status: ' + error.message);
      });
  };
  

  return (
    <div className='flex'>
        <Sidebar />
        <div className='flex-1 p-6 ml-64'>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Examiner Mobile List</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <label className="block">
                    <span className="text-gray-700">Examiner Name:</span>
                    <input type="text" name="examinerName" value={filters.examinerName} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700">Examiner Phone:</span>
                    <input type="text" name="examinerPhone" value={filters.examinerPhone} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700">Active:</span>
                    <select name="active" value={filters.active} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                    </select>
                </label>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                <thead className='bg-gray-50'>
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examiner Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examiner Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {filteredExaminerMobiles.map(examinerMobile => (
                    <tr key={examinerMobile.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{examinerMobile.EXAMINER_NAME}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{examinerMobile.EXAMINER_PHONE}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${examinerMobile.ACTIVE ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {examinerMobile.ACTIVE ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleToggleActivation(examinerMobile.id, examinerMobile.ACTIVE)} className="text-yellow-600 hover:text-yellow-900 mr-4">
                          {examinerMobile.ACTIVE ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(examinerMobile.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ExaminerMobile;