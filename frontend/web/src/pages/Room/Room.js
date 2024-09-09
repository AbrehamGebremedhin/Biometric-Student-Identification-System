import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const [filter, setFilter] = useState({ roomNo: '', examTime: '' });

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
        const fetchRooms = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/v1/rooms/", {
                  headers: {
                    'Authorization': `Bearer ${getCookieValue("token")}`
                  }
                });
                setRooms(response.data);
              } catch (error) {
                console.error('Error fetching messages:', error);
              }
        };
        fetchRooms();
      }, []);

      const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
          ...filter,
          [name]: value
        });
      };

      const filteredRooms = rooms.filter(room => {
        return (
          (filter.roomNo === '' || room.ROOM_NO.includes(filter.roomNo)) &&
          (filter.examTime === '' || room.EXAM_TIME.includes(filter.examTime))
        );
      });
    

    const handleEdit = (room) => {
        // Implement edit functionality
    };

    const handleDelete = (roomId) => {
        // Implement delete functionality
    };


    return (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1 p-6 ml-64'>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Room Table</h1>
                    <div className="mb-4 flex space-x-4">
                        <input
                            type="text"
                            name="roomNo"
                            placeholder="Filter by Room No"
                            value={filter.roomNo}
                            onChange={handleFilterChange}
                            className="border border-gray-300 p-2 rounded"
                        />
                        <input
                            type="text"
                            name="examTime"
                            placeholder="Filter by Exam Time"
                            value={filter.examTime}
                            onChange={handleFilterChange}
                            className="border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Room No</th>
                                <th className="py-2 px-4 border-b">Exam Time</th>
                                <th className="py-2 px-4 border-b">Number of Students</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-gray-100">
                                    <td className="py-2 px-4 border-b">{room.ROOM_NO}</td>
                                    <td className="py-2 px-4 border-b">{room.EXAM_TIME}</td>
                                    <td className="py-2 px-4 border-b">{room.STUDENT_LIST.length}</td>
                                    <td className="py-2 px-4 border-b flex justify-center">
                                        <button 
                                            onClick={() => handleEdit(room)} 
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            View data
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(room.id)} 
                                            className="text-red-600 hover:text-red-900 mr-4"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Link 
                        to={'/add-room'}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add New Room
                    </Link>
                </div>
            </div>    
        </div>
    );
};

export default Room;