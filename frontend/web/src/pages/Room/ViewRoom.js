import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getCookieValue } from '../../utils/getCookieValue';
import { errorHandler } from '../../utils/errorHandler';
import Sidebar from '../../components/SideBar';

const ViewRoom = () => {
    const { roomNo, examTime } = useParams();
    const [students, setStudents] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/v1/rooms/${roomNo}`, {
                    params: { exam_time: examTime },
                    headers: {
                        'Authorization': `Bearer ${getCookieValue("token")}`
                      }
                });
                setStudents(response.data);
            } catch (error) {
                const errorMessage = errorHandler(error, navigate);
                setErrorMessage(errorMessage);
            }
        };

        fetchStudents();
    }, [roomNo, examTime, navigate]);

    return (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1 p-6 ml-64'>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Student List</h1>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b">Student ID</th>
                                    <th className="py-2 px-4 border-b">Student Name</th>
                                    <th className="py-2 px-4 border-b">Student Batch</th>
                                    <th className="py-2 px-4 border-b">Course Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{student.student_id}</td>
                                        <td className="py-2 px-4 border-b">{student.student_name}</td>
                                        <td className="py-2 px-4 border-b">{student.student_batch}</td>
                                        <td className="py-2 px-4 border-b">{student.takes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                    </div>
                </div>
            </div>
        </div>            
        
    );
};

export default ViewRoom;