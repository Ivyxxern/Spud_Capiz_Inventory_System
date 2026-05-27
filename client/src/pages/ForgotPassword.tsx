import { useState } from 'react';
import { Link } from 'react-router-dom';
// import api from '../services/api'; // Uncomment when Laravel /forgot-password is ready

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // NOTE: Once you configure Laravel's mail server, you will uncomment this line:
      // await api.post('/forgot-password', { email });

      // For now, we simulate a successful API request so you can test the UI
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: 'If an account with that email exists, we have sent a password reset link.',
        });
        setEmail('');
        setLoading(false);
      }, 1000);
    } catch {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">SPUD Capiz</h2>
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">Reset Password</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your registered email address and we will send you a link to reset your password.
        </p>

        {message.text && (
          <div className={`p-3 rounded-lg mb-6 text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="owner@spudcapiz.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400 mt-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
