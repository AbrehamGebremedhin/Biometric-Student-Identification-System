import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Student = () => {
    const [students, setStudents] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');

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

    const handleDelete = (id) => {
        const confirmed = window.confirm('Are you sure you want to remove this student?');
        if (confirmed) {
            axios.delete(`http://127.0.0.1:8000/api/v1/students/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${getCookieValue("token")}`
                }
            })
            .then(response => {
                alert('Student has been removed successfully');
                // Remove the deleted course from the state
                setStudents(students.filter(student => student.STUDENT_ID !== id));
            })
            .catch(error => {
                alert('Error removing student: ' + error.message);
            });
        }
    };

    useEffect(() => {
        // Fetch courses from the server
        const fetchStudents = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/v1/students/", {
                  headers: {
                    'Authorization': `Bearer ${getCookieValue("token")}`
                  }
                });
                setStudents(response.data);
              } catch (error) {
                console.error('Error fetching messages:', error);
              }
        };
        fetchStudents();
      }, []);

    const filteredStudents= students.filter(student => 
        student.STUDENT_NAME?.toLowerCase().includes(nameFilter.toLowerCase()) &&
        student.STUDENT_BATCH?.toLowerCase().includes(batchFilter.toLowerCase())
    );

    return (
        <div className="flex">
            <Sidebar/>
            <div className="flex-1 p-6 ml-64">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Student</h1>
                    <div className="mb-4 flex space-x-4">
                        <div>
                            <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700">Filter by Name:</label>
                            <input 
                                type="text" 
                                id="nameFilter" 
                                value={nameFilter} 
                                onChange={(e) => setNameFilter(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="termFilter" className="block text-sm font-medium text-gray-700">Filter by Batch:</label>
                            <input 
                                type="text" 
                                id="termFilter" 
                                value={batchFilter} 
                                onChange={(e) => setBatchFilter(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map(student => (
                                <tr key={student.STUDENT_ID}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.STUDENT_ID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.STUDENT_NAME}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.STUDENT_BATCH}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/edit-student/${student.STUDENT_ID}`} state={student.STUDENT_ID}  
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(student.STUDENT_ID)} 
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Link
                        to="/new-student"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add New Student
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Student;