import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUserAdd, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineIdentification } from "react-icons/hi";
import axiosInstance from "../functions/axiosInstance";
import useUserStore from "../store/useUserStore";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fetchUserInfo = useUserStore(u=>u.fetchUserInfo);
  const setToken = useUserStore(u=>u.setToken);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/v1/register`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data?.message);
      if (data?.authToken) {
        await setToken(data.authToken);
      }
      fetchUserInfo().then(() => {
        navigate("/my-accounts");
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message[0]?.msg || err.response?.data?.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/v1/google`,
        { token },
        { withCredentials: true }
      );
      toast.success(data?.message || "Google login successful!");
      if (data?.authToken) {
        await setToken(data.authToken);
      }
      fetchUserInfo().then(() => {
        navigate("/my-accounts");
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Google sign up failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign up failed. Please try again.");
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <HiOutlineUserAdd className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-white/70 text-sm mt-1">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-white hover:text-white/90 underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            {/* Google Login */}
            <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:!w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="400"
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs font-medium text-gray-400 bg-white">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineUser className="w-4 h-4 text-gray-400" />
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
                >
                  <HiOutlineUser className="w-4 h-4 text-gray-400" />
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
              >
                <HiOutlineIdentification className="w-4 h-4 text-gray-400" />
                Username
              </label>
              <input
                id="username"
                name="userName"
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                placeholder="Choose a username"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
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
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
              >
                <HiOutlineLockClosed className="w-4 h-4 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
              >
                <HiOutlineLockClosed className="w-4 h-4 text-gray-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white placeholder-gray-400 text-gray-900"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
