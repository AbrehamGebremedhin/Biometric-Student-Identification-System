import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Exam = () => {
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({
    examDate: '',
    name: '',
    term: '',
    type: ''
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
    // Fetch exams from the server
    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/v1/exams/", {
              headers: {
                'Authorization': `Bearer ${getCookieValue("token")}`
              }
            });
            setExams(response.data);
          } catch (error) {
            console.error('Error fetching messages:', error);
          }
    };
    fetchCourses();
  }, []);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleDelete = (examId) => {
    const confirmed = window.confirm('Are you sure you want to delete this Exam?');
    if (confirmed) {
        axios.delete(`http://127.0.0.1:8000/api/v1/exams/${examId}/`, {
            headers: {
                'Authorization': `Bearer ${getCookieValue("token")}`
            }
        })
        .then(response => {
            alert('Exam deleted successfully');
            // Remove the deleted exam from the state
            setExams(exams.filter(exam => exam.id !== examId));
        })
        .catch(error => {
            alert('Error deleting exam: ' + error.message);
        });
    }
  };

  const filteredExams = exams.filter(exam => {
    return (
      (filters.examDate === '' || exam.EXAM_DATE.includes(filters.examDate)) &&
      (filters.name === '' || exam.COURSE_CODE.COURSE_CODE.includes(filters.name)) &&
      (filters.term === '' || exam.COURSE_CODE.TERM.includes(filters.term)) &&
      (filters.type === '' || exam.EXAM_TYPE.includes(filters.type))
    );
  });

  return (
    <div className='flex'>
        <Sidebar />
        <div className='flex-1 p-6 ml-64'>
          <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Exam List</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <label className="block">
                  <span className="text-gray-700">Exam Date:</span>
                  <input type="date" name="examDate" value={filters.examDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </label>
                  <label className="block">
                  <span className="text-gray-700">Name:</span>
                  <input type="text" name="name" value={filters.name} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </label>
                  <label className="block">
                  <span className="text-gray-700">Term:</span>
                  <input type="text" name="term" value={filters.term} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </label>
                  <label className="block">
                  <span className="text-gray-700">Type:</span>
                  <input type="text" name="type" value={filters.type} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </label>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className='bg-gray-50'>
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Duration(minutes)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredExams.map(exam => (
                      <tr key={exam.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">
                          {exam.course_code.COURSE_CODE} - {exam.course_code.COURSE_NAME} - {exam.course_code.TERM}
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap">{exam.EXAM_DATE}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{exam.EXAM_TIME}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{exam.EXAM_DURATION}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{exam.EXAM_TYPE}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/edit-exam/${exam.id}`} state={exam.id}  
                                            className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                            <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              <br/>
              <Link to={'/add-exam'} type='button' className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Add New Exam</Link>
          </div>
        </div>
    </div>
  );
};

export default Exam;