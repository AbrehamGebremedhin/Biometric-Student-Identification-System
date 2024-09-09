import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Course from './pages/Courses/Course';
import Login from './pages/Login';
import AddCourse from './pages/Courses/AddCourse';
import EditCourse from './pages/Courses/EditCourse';
import Student from './pages/Student/Student';
import NewStudent from './pages/Student/NewStudent';
import EditStudent from './pages/Student/EditStudent';
import Exam from './pages/Exam/Exam';
import AddExam from './pages/Exam/AddExam';
import UpdateExam from './pages/Exam/EditExam';
import Room from './pages/Room/Room';
import AddRoom from './pages/Room/AddRoom';


function App() {
  const client = new QueryClient({
    defaultOptions: {
      queries:{
        refetchInterval: 20000,
        refetchOnWindowFocus: false
      }
    }
  });
  return (
    <div>
      <QueryClientProvider client={client}>
        <Router>
          <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/course' element={<Course/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/add-course' element={<AddCourse/>}/>
            <Route path='/edit-course/:courseId' element={<EditCourse/>}/>
            <Route path='/student' element={<Student/>}/>
            <Route path='/new-student' element={<NewStudent/>}/>
            <Route path='/edit-student/:id' element={<EditStudent/>}/>
            <Route path='/exam' element={<Exam/>}/>
            <Route path='/add-exam' element={<AddExam/>}/>
            <Route path='/edit-exam/:examId' element={<UpdateExam/>}/>
            <Route path='/room' element={<Room/>}/>
            <Route path='/add-room' element={<AddRoom/>}/>
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;