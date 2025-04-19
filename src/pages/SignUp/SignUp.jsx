import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import Footer from "../../components/Footer/Footer";
import Logo from "../../components/Logo/Logo";
const Button = ({ type, className, children }) => (
  <button
    type={type}
    className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all ${className}`}
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
export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          userName: username,
          status: false,
          createdAt: new Date().toISOString(),
        });
        window.location.href = "/plans?from=signup";
      }
      console.log("User registered successfully!");
      toast.success("User Registered Successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white">
      <Navbar />
      <main className="py-12">
        <div className="max-w-md mx-auto px-6">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <div className="bg-black bg-opacity-50 p-8 rounded-2xl backdrop-blur-sm border border-purple-900 w-[25vw]">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Create Your Account
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-Enter Your Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </div>
              <div className="mt-6 text-center text-gray-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Log In
                </a>
              </div>
            </form>
          </div>
          <div className="mt-8">
            <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg">
              <h3 className="font-bold mb-2">Streaming Benefits:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Access to exclusive content</li>
                <li>AI generated Recommendations</li>
                <li>Stream on any device</li>
                <li>Ad-free experience</li>
                <li>First 7 days free</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
