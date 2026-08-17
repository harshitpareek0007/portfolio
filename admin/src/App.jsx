import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Skills from './pages/Skills';
import Education from './pages/Education';
import Certifications from './pages/Certifications';
import Blogs from './pages/Blogs';
import Testimonials from './pages/Testimonials';
import Messages from './pages/Messages';
import SiteSettings from './pages/SiteSettings';
import Profile from './pages/Profile';
import Loader from './components/ui/Loader';

const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen"><Loader /></div>;
    if (!admin) return <Navigate to="/login" />;
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="projects" element={<Projects />} />
          <Route path="experience" element={<Experience />} />
          <Route path="skills" element={<Skills />} />
          <Route path="education" element={<Education />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
