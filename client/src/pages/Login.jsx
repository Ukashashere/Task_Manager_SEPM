import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { authApi } from "../utils/authApi";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login & sign-up

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submitHandler = async (data) => {
    console.log("Form data submitted:", data);
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        // Login Logic
        const response = await authApi.login(data);
        console.log("API Response:", response);

        if (response && response._id) {
          console.log("Dispatching setUser action with user data");
          dispatch(setUser(response));
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          console.error("Login failed:", response?.message || "Unknown error");
          setErrorMessage(response?.message || "Invalid login credentials. Please try again.");
        }
      } else {
        // Sign Up Logic - Add default role and title
        const signUpData = {
          ...data,
          role: "employee", // Default role
          title: "New Employee", // Default title
        };

        const response = await authApi.register(signUpData);
        console.log("Sign-up Response:", response);

        if (response && response._id) {
          setSuccessMessage("Account created successfully! Redirecting...");
          setTimeout(() => setIsLogin(true), 2000); // Switch to login after signup
        } else {
          setErrorMessage(response?.message || "Something went wrong.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        
        {/* Left Side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600">
              Manage all your tasks in one place!
            </span>
            <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>

            <div className="cell">
              <div className={`circle ${loading ? "animate-spin" : "rotate-in-up-left"}`}></div>
            </div>
          </div>
        </div>

        {/* Right Side (Login / Sign Up Form) */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-6 bg-white px-10 pt-14 pb-14"
          >
            <div>
              <p className="text-blue-600 text-3xl font-bold text-center">
                {isLogin ? "Welcome back!" : "Create an Account"}
              </p>
              <p className="text-center text-base text-gray-700">
                {isLogin ? "Keep all your credentials safe." : "Join us and manage your tasks easily."}
              </p>
            </div>

            <div className="flex flex-col gap-y-5">
              {/* Show Full Name field only for Sign Up */}
              {!isLogin && (
                <Textbox
                  placeholder="Full Name"
                  type="text"
                  name="name"
                  label="Full Name"
                  className="w-full rounded-full"
                  register={register("name", {
                    required: "Full Name is required!",
                  })}
                  error={errors.name ? errors.name.message : ""}
                />
              )}

              <Textbox
                placeholder="email@example.com"
                type="email"
                name="email"
                label="Email Address"
                className="w-full rounded-full"
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />

              <Textbox
                placeholder="Your password"
                type="password"
                name="password"
                label="Password"
                className="w-full rounded-full"
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password.message : ""}
              />

              {isLogin && (
                <span className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer">
                  Forget Password?
                </span>
              )}

              <Button
                type="submit"
                label={loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Sign Up"}
                className={`w-full h-10 rounded-full ${loading ? "bg-gray-400" : "bg-blue-700 text-white"}`}
                disabled={loading}
              />
            </div>

            {/* Loading Animation */}
            {loading && (
              <div className="flex justify-center mt-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Display error/success message */}
            {errorMessage && <p className="text-red-600 text-sm text-center mt-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-600 text-sm text-center mt-2">{successMessage}</p>}

            {/* Toggle Login / Sign Up */}
            <p className="text-center mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 ml-1">
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
