import React, { useState, useEffect } from 'react';
import Sidebar from '../components/SideBar';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getCookieValue } from '../utils/getCookieValue';
import { errorHandler } from '../utils/errorHandler';

const Home = () => {
  const [examinerMobilesCount, setExaminerMobilesCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [examsCount, setExamsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examinerMobilesResponse = await axios.get("http://127.0.0.1:8000/api/v1/examiners/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setExaminerMobilesCount(examinerMobilesResponse.data.length);

        const roomsResponse = await axios.get("http://127.0.0.1:8000/api/v1/rooms/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setRoomsCount(roomsResponse.data.length);

        const coursesResponse = await axios.get("http://127.0.0.1:8000/api/v1/courses/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setCoursesCount(coursesResponse.data.length);

        const examsResponse = await axios.get("http://127.0.0.1:8000/api/v1/exams/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setExamsCount(examsResponse.data.length);
      } catch (error) {
        const errorMsg = errorHandler(error, navigate);
        setErrorMessage(errorMsg);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-6 ml-64'>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold">Examiner Mobiles</h2>
              <p className="text-2xl">{examinerMobilesCount}</p>
              <Link to="/examiner-mobiles" className="text-blue-500">View Details</Link>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold">Rooms</h2>
              <p className="text-2xl">{roomsCount}</p>
              <Link to="/rooms" className="text-blue-500">View Details</Link>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold">Courses</h2>
              <p className="text-2xl">{coursesCount}</p>
              <Link to="/courses" className="text-blue-500">View Details</Link>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold">Exams</h2>
              <p className="text-2xl">{examsCount}</p>
              <Link to="/exams" className="text-blue-500">View Details</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;