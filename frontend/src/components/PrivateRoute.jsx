import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Wait until AuthContext is fully loaded (i.e., `user` is defined)
  if (user === undefined) {
    return <div>Loading...</div>; // Show loading screen or spinner while checking auth
  }

  // If the user is logged in, show the children (protected content)
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
