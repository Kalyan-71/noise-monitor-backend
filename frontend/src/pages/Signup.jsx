import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import axiosInstance from '../api/axiosInstance';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate(); // ✅ Initialize useNavigate hook

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/signup', form);
      
      localStorage.setItem('token', res.data.token);
      navigate('/'); // ✅ Redirect to home page after successful signup
    } catch (err) {
      alert(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
    <form onSubmit={handleSubmit}>
    <div className="mb-4">

    <label className="block text-sm font-medium text-gray-700" htmlFor="Name">Name</label>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={handleChange}
      />
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="Email">Email</label>
      <input
        name="email"
        className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
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
      />
         </div>
         <div className="mb-4">
      <button type="submit" className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Sign Up</button>
      </div>
    </form>

      </div>
    </div>
  );
};

export default Signup;
