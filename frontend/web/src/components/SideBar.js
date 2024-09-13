// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';


const Sidebar = () => {
    return (
        <div className="fixed top-0 m-0 h-screen w-64 first-letter
                    flex flex-col bg-white text-black shadow-lg">
            <Link to={'/'} className="p-4 text-xl font-bold">BSIS</Link>
            <nav className="mt-10">
                <ul> 
                    <Link to={'/attendance'}> <li className="px-4 py-2 hover:bg-gray-300">Attendance</li></Link>
                    <Link to={'/course'}><li className="px-4 py-2 hover:bg-gray-300">Courses</li></Link>
                    <Link to={'/exam'}><li className="px-4 py-2 hover:bg-gray-300">Exams</li></Link>
                    <Link to={'/examinerMobile'}><li className="px-4 py-2 hover:bg-gray-300">Mobile Applications</li></Link>
                    <Link to={'/room'}><li className="px-4 py-2 hover:bg-gray-300">Room</li></Link>
                    <Link to={'/student'}><li className="px-4 py-2 hover:bg-gray-300">Student</li></Link>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
 