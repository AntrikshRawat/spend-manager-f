import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
import axiosInstance from '../functions/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineKey, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck, HiCheck } from 'react-icons/hi';

const steps = [
  { id: 1, label: 'Email', icon: HiOutlineMail },
  { id: 2, label: 'Verify OTP', icon: HiOutlineKey },
  { id: 3, label: 'New Password', icon: HiOutlineLockClosed },
];

function StepProgress({ currentStep }) {
  return (
    <div className="flex items-center justify-center px-6 pt-5 pb-2">
      {steps.map((s, idx) => {
        const isCompleted = currentStep > s.id;
        const isActive = currentStep === s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-purple-600 text-white shadow-md'
                    : isActive
                    ? 'bg-white border-purple-500 text-purple-600 shadow-md ring-4 ring-purple-100'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <HiCheck className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${
                  isCompleted
                    ? 'text-purple-600'
                    : isActive
                    ? 'text-purple-600'
                    : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connector pipe */}
            {idx < steps.length - 1 && (
              <div className="relative w-16 sm:w-20 h-0.5 mx-1 mb-5">
                <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                    currentStep > s.id ? 'w-full bg-gradient-to-r from-blue-600 to-purple-600' : 'w-0 bg-purple-600'
                  }`}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const user = useUserStore(u => u.user);
  const logOutUser = useUserStore(u => u.logOutUser);
  const loggedIn = useUserStore(u => u.isLoggedIn);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      setEmail(user?.email);
    }
  }, [user]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email) {
      toast.error('Please enter your email address');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setIsSubmitting(false);
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
          tempToken: tempTokenToSend,
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
        navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <HiOutlineShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Create New Password'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {step === 1
                ? 'Enter your email to receive a verification code'
                : step === 2
                ? 'Enter the OTP sent to your email'
                : 'Set a new secure password'}
            </p>
          </div>

          {/* Step Progress */}
          <StepProgress currentStep={step} />

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="p-6 pt-3 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineMail className="w-4 h-4 text-gray-400" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  disabled={user?.email}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your email address"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
              {!loggedIn && (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Back to Sign in
                  </Link>
                </div>
              )}
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="p-6 pt-3 space-y-5">
              <div>
                <label
                  htmlFor="otp"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineKey className="w-4 h-4 text-gray-400" />
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900 text-center tracking-widest text-lg"
                  placeholder="Enter OTP"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Code sent to <span className="font-medium text-gray-600">{email}</span>
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); }}
                className="w-full text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors text-center"
              >
                Resend or change email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleSetNewPassword} className="p-6 pt-3 space-y-5">
              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineLockClosed className="w-4 h-4 text-gray-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                    placeholder="Create a new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineLockClosed className="w-4 h-4 text-gray-400" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Resetting Password...
                  </>
                ) : (
                  'Set New Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
