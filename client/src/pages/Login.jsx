import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/item/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        navigate('/home'); // Redirect to dashboard after login
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border-4 border-[#FF9933]">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#138808]">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#FF9933]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#FF9933]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-[#138808] text-white font-semibold rounded-md hover:bg-[#0e6a06] transition-all duration-300"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Dont have an account?{' '}
          <span className="text-[#FF9933] font-bold cursor-pointer hover:underline" onClick={handleSignup}>
            Create new account
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
