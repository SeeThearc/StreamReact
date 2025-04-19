import { useState } from "react";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import Footer from "../../components/Footer/Footer";
import Logo from "../../components/Logo/Logo";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { toast } from "react-toastify";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
const Button = ({ type, className, children, onClick }) => (
  <button
    type={type}
    className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);
const Navbar = () => (
  <nav className="px-6 py-4 flex justify-between items-center">
    <div className="flex items-center">
      <Logo />
    </div>
    <div className="flex items-center space-x-4">
      <a
        href="/"
        className="flex items-center text-purple-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Home
      </a>
    </div>
  </nav>
);

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        toast.error("Account not found. Please sign up first.");
        navigate("/signup");
        return;
      } else if (userDoc.exists() && userDoc.data().status === false) {
        await auth.signOut();
        toast.error("Please complete plan selection to activate your account");
        navigate("/plans?from=signup");
        return;
      }
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "Users", user.uid));

      if (!userDoc.exists()) {
        await auth.signOut();
        toast.error("Account not found. Please sign up first.");
        navigate("/signup");
        return;
      } else if (userDoc.exists() && userDoc.data().status === false) {
        await auth.signOut();
        toast.error("Please complete plan selection to activate your account");
        navigate("/plans?from=signup");
        return;
      }

      if (!userDoc.data().status) {
        await auth.signOut();
        toast.error("Please complete plan selection to activate your account");
        navigate("/plans?from=signup");
        return;
      }

      toast.success("User logged in successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error(error.message || "Google login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white">
      <Navbar />

      <main className="py-16">
        <div className="max-w-md mx-auto px-6">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <div className="bg-black bg-opacity-50 p-8 rounded-2xl backdrop-blur-sm border border-purple-900">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </div>

              <div className="my-6 relative flex items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <div className="flex justify-center items-center">
                <button
                  type="button"
                  className="flex items-center justify-center p-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={googleLogin}
                >
                  <svg
                    className="w-full h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
              </div>

              <div className="mt-6 text-center text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Sign Up
                </a>
              </div>
            </form>
          </div>

          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg flex items-start">
            <div className="p-2 bg-purple-600 rounded-lg mr-3">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Secure Login</h3>
              <p className="text-xs text-gray-300">
                Your connection to StreamSphere is encrypted and secure. We
                never share your personal information.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
