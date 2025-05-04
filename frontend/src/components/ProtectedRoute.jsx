import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Fetch the authentication status from the backend
    fetch('http://localhost:5000/api/me', {
      credentials: 'include',  // Include cookies for session validation
    })
      .then(res => {
        if (res.ok) {
          setAuth(true);  // User is authenticated
        } else {
          setAuth(false);  // User is not authenticated
        }
      })
      .catch(() => {
        setAuth(false);  // In case of error, assume the user is not authenticated
      });
  }, []);

  // Show loading while we are checking authentication status
  if (auth === null) return <div>Loading...</div>;

  // If user is authenticated, render the children (protected routes)
  return auth ? children : <Navigate to="/login" />;
}
