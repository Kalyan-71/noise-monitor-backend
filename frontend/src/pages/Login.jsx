import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the context

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // Use navigate hook for redirection
  const { login } = useAuth(); // Access login function from context

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
        const res = await axiosInstance.post('/auth/login', form);
        console.log(res.data);

        if (res.data.token) {
          localStorage.setItem('token', res.data.token); // Save token in localStorage
          login(res.data.user); // Set the user in context after login
          navigate('/'); // ✅ Redirect to home after successful login
        } else {
          alert('Token missing, login failed.');
        }
    
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
         <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        
         {/* {error && <div className="text-red-500 text-center mb-4">{error}</div>} */}
    
    <form onSubmit={handleSubmit}>
    <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
             <input
        name="email" 
        placeholder="Email" 
        className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.email}
        onChange={handleChange} 
        required 
      />
      
      </div>

      
      <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
       
        name="password" 
        type="password" 
             className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Password" 
        value={form.password}
        onChange={handleChange} 
        required 
      />
      </div>

        
      <div className="mb-4">
      <button type="submit"  className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Login</button>
      </div>
    
    </form>


         <div className="text-center">
           <p className="text-sm text-gray-600">
             Don't have an account?{' '}
             <a href="/signup" className="text-blue-500 hover:underline">
               Sign Up
             </a>
           </p>
         </div>
       </div>
     </div>
   );
 }

export default Login;


    

         


          



       
    

