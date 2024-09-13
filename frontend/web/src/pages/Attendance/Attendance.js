import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { errorHandler } from '../../utils/errorHandler'; 
import { getCookieValue } from '../../utils/getCookieValue';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar'; 

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  // Filter states
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [examIdFilter, setExamIdFilter] = useState("");
  const [roomNoFilter, setRoomNoFilter] = useState("");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("");

  // State to control the visibility of the report generation form
  const [showReportForm, setShowReportForm] = useState(false);

  // Form states for report generation
  const [criteria, setCriteria] = useState("");
  const [value, setValue] = useState("");
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    // Fetch examinerMobiles from the server
    const fetchExaminerMobiles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/attendances/", {
          headers: {
            'Authorization': `Bearer ${getCookieValue("token")}`
          }
        });
        setAttendanceData(response.data);
        console.log(response.data);
        setFilteredData(response.data);
      } catch (error) {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
      }
    };
    fetchExaminerMobiles();
  }, [navigate]);

  useEffect(() => {
    // Filter the attendance data based on the filter inputs
    const filtered = attendanceData.filter(attendance => 
      (studentIdFilter === "" || attendance.STUDENT_ID.toLowerCase().includes(studentIdFilter.toLowerCase())) &&
      (examIdFilter === "" || attendance.EXAM_ID.toLowerCase().includes(examIdFilter.toLowerCase())) &&
      (roomNoFilter === "" || attendance.ROOM_NO.toLowerCase().includes(roomNoFilter.toLowerCase())) &&
      (attendanceStatusFilter === "" || 
        (attendanceStatusFilter === "Present" && attendance.ATTENDANCE_STATUS) ||
        (attendanceStatusFilter === "Absent" && !attendance.ATTENDANCE_STATUS))
    );
    setFilteredData(filtered);
  }, [studentIdFilter, examIdFilter, roomNoFilter, attendanceStatusFilter, attendanceData]);

  const handleGenerateReport = async() => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/attendances/generate-report/', {
        params: {
          "criteria": criteria,
          "value": value,
          "file_type": fileType
        },
        headers:{
          'Authorization': `Bearer ${getCookieValue("token")}`
        },
        responseType: 'blob' // Important for downloading files
      });
  
      // Create a URL for the file and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.' + fileType); // Specify the file name and type
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
        const errorMessage = errorHandler(error, navigate);
        setErrorMessage(errorMessage);
    }
  };

  return (
    <div className='flex'>
        <Sidebar />
        <div className='flex-1 p-6 ml-64'>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Attendance Table</h1>
                
                {/* Filter Inputs */}
                <div className="mb-4">
                    <input 
                    type="text" 
                    placeholder="Filter by Student ID" 
                    value={studentIdFilter} 
                    onChange={(e) => setStudentIdFilter(e.target.value)} 
                    className="mr-2 p-2 border border-gray-300"
                    />
                    <input 
                    type="text" 
                    placeholder="Filter by Exam ID" 
                    value={examIdFilter} 
                    onChange={(e) => setExamIdFilter(e.target.value)} 
                    className="mr-2 p-2 border border-gray-300"
                    />
                    <input 
                    type="text" 
                    placeholder="Filter by Room No" 
                    value={roomNoFilter} 
                    onChange={(e) => setRoomNoFilter(e.target.value)} 
                    className="mr-2 p-2 border border-gray-300"
                    />
                    <select 
                    value={attendanceStatusFilter} 
                    onChange={(e) => setAttendanceStatusFilter(e.target.value)} 
                    className="p-2 border border-gray-300"
                    >
                    <option value="">Filter by Attendance Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    </select>
                </div>

                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">Student ID</th>
                        <th className="py-2 px-4 border-b">Exam ID</th>
                        <th className="py-2 px-4 border-b">Room No</th>
                        <th className="py-2 px-4 border-b">Attendance Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map((attendance, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{attendance.student_id.STUDENT_NAME}</td>
                        <td className="py-2 px-4 border-b">{attendance.exam_id.course_code.COURSE_CODE} - {attendance.exam_id.course_code.COURSE_NAME} - {attendance.exam_id.course_code.TERM} - {attendance.exam_id.EXAM_TYPE}</td>
                        <td className="py-2 px-4 border-b">{attendance.room_no.ROOM_NO}</td>
                        <td className="py-2 px-4 border-b">
                            {attendance.ATTENDANCE_STATUS ? (
                            <span className="text-green-500">Present</span>
                            ) : (
                            <span className="text-red-500">Absent</span>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                </table>

                {/* Generate Report Button */}
                <div className="mt-4">
                    <button 
                    onClick={() => setShowReportForm(!showReportForm)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                    Generate Report
                    </button>
                </div>

                {/* Report Generation Form */}
                {showReportForm && (
                    <div className="mt-4 p-4 border border-gray-300">
                        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
                        <div className="mb-2">
                            <label className="block mb-1">Criteria</label>
                            <select 
                            value={criteria} 
                            onChange={(e) => setCriteria(e.target.value)} 
                            className="p-2 border border-gray-300 w-full"
                            >
                            <option value="">Select Criteria</option>
                            <option value="COURSE_CODE">Course Code</option>
                            <option value="STUDENT_BATCH">Student Batch</option>
                            <option value="ROOM_NO">Room No</option>
                            </select>
                        </div>

                        <div className="mb-2">
                            <label className="block mb-1">Value</label>
                            <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                            className="p-2 border border-gray-300 w-full"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block mb-1">File Type</label>
                            <select 
                            value={fileType} 
                            onChange={(e) => setFileType(e.target.value)} 
                            className="p-2 border border-gray-300 w-full"
                            >
                            <option value="">Select File Type</option>
                            <option value="pdf">PDF</option>
                            <option value="docx">DOCX</option>
                            </select>
                        </div>

                        <button 
                        onClick={handleGenerateReport} 
                        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                        >
                        Proceed
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>        
  );
};

export default AttendanceTable;
