const Logo = () => (
  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
    StreamSphere
  </div>
);
const Navbar = () => (
  <nav className="px-6 py-4 flex justify-between items-center">
    <div className="flex items-center">
      <Logo />
    </div>
    <div className="flex items-center space-x-4">
      <a
        href="/login"
        className="text-purple-300 hover:text-white transition-colors"
      >
        Login
      </a>
      <a
        href="/signup"
        className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        Sign Up
      </a>
    </div>
  </nav>
);
export default Navbar;