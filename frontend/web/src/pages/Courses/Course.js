import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { errorHandler } from '../../utils/errorHandler';
import { getCookieValue } from '../../utils/getCookieValue';


const Course = () => {
    const [courses, setCourses] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const [termFilter, setTermFilter] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleDelete = (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this course?');
        if (confirmed) {
            axios.delete(`http://127.0.0.1:8000/api/v1/courses/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${getCookieValue("token")}`
                }
            })
            .then(response => {
                alert('Course deleted successfully');
                // Remove the deleted course from the state
                setCourses(courses.filter(course => course.id !== id));
            })
            .catch(error => {
                const errorMsg = errorHandler(error, navigate);
                alert('Error deleting course: ' + errorMsg);
            });
        }
    };

    useEffect(() => {
        // Fetch courses from the server
        const fetchCourses = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/v1/courses/", {
                  headers: {
                    'Authorization': `Bearer ${getCookieValue("token")}`
                  }
                });
                setCourses(response.data);
              } catch (error) {
                const errorMsg = errorHandler(error, navigate);
                setErrorMessage(errorMsg);
              }
        };
        fetchCourses();
      }, [navigate]);

    const filteredCourses = courses.filter(course => 
        course.COURSE_NAME.toLowerCase().includes(nameFilter.toLowerCase()) &&
        course.TERM.toLowerCase().includes(termFilter.toLowerCase())
    );

    return (
        <div className="flex">
            <Sidebar/>
            <div className="flex-1 p-6 ml-64">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Course</h1>
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
                            <label htmlFor="termFilter" className="block text-sm font-medium text-gray-700">Filter by Term:</label>
                            <input 
                                type="text" 
                                id="termFilter" 
                                value={termFilter} 
                                onChange={(e) => setTermFilter(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCourses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.COURSE_NAME}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.COURSE_CODE}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{course.TERM}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/edit-course/${course.id}`} state={course.id}  
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(course.id)} 
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </table>
                    <Link
                        to="/add-course"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add New Course
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Course;