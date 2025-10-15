import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
import useUserStore from '../store/useUserStore';
import axiosInstance from '../functions/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const { user,logOutUser } = useUserStore();
  const [email,setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    if(user?.email) {
      setEmail(user?.email);
    }
  },[user])
  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Email validation
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/userAccount/forgotpassword/verificationcode`,
        { email },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || 'OTP sent to your email');
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/userAccount/forgotpassword/verifyOtp`,
        { email, verificationCode: otp },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || 'OTP verified successfully');
        if (data.tempToken) {
          setTempToken(data.tempToken);
          localStorage.setItem('forgotPasswordTempToken', data.tempToken);
        }
        setStep(3);
      } else {
        toast.error(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to verify OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Set new password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const tempTokenToSend = tempToken || localStorage.getItem('forgotPasswordTempToken');
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/userAccount/forgotpassword/reset`,
        {
          email,
          newPassword,
          tempToken: tempTokenToSend
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || 'Password reset successfully!');
        setStep(1);
        setOtp('');
        setTempToken('');
        setNewPassword('');
        setConfirmNewPassword('');
        localStorage.removeItem('forgotPasswordTempToken');
        logOutUser();
        navigate("/login");
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            {step === 3 ? 'Create New Password' : 'Forgot Password'}
          </h2>
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onChange={(e)=>{setEmail(e.target.value)}}
                  value={email}
                  disabled = {user?.email}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleSetNewPassword} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
