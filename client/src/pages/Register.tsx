import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

const getRegisterErrorMessage = (err: unknown): string => {
  if (!axios.isAxiosError(err)) {
    return 'Registration failed. Please check your details.';
  }

  const data = err.response?.data as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (data?.errors) {
    const firstError = Object.values(data.errors).flat()[0];
    if (firstError) return firstError;
  }

  return data?.message ?? 'Registration failed. Please check your details.';
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/(?=.*[0-9])/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      {isVisible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      )}
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">SPUD Capiz</h2>
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">Create Account</h3>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ characters, with at least 1 uppercase and 1 number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <EyeIcon isVisible={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
