import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import TutorProfile from "./pages/TutorProfile";
import BookSlot from "./pages/BookSlot";
import RegisterTutor from "./pages/RegisterTutor";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import MyBookings from "./pages/MyBookings";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import { getCurrentUser } from "./utils/auth";

const RequireAuth = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const location = useLocation();

  // ✅ hide navbar on login, signup, and 404 page
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/404";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/tutors/:id"
          element={
            <RequireAuth>
              <TutorProfile />
            </RequireAuth>
          }
        />

        <Route
          path="/book/:id"
          element={
            <RequireAuth>
              <BookSlot />
            </RequireAuth>
          }
        />

        <Route
          path="/register-tutor"
          element={
            <RequireAuth>
              <RegisterTutor />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/bookings"
          element={
            <RequireAuth>
              <MyBookings />
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />

        <Route
          path="/reviews/:bookingId"
          element={
            <RequireAuth>
              <Reviews />
            </RequireAuth>
          }
        />

        {/* ✅ 404 */}
        <Route path="/404" element={<NotFound />} />

        {/* ✅ everything else redirects to /404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
