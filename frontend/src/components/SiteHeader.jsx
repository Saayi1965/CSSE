// src/components/Header.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-between items-center px-6 lg:px-16 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-emerald-100"
    >
      {/* 🔹 Logo + Title */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-xl">
          <span className="text-white text-2xl">🗑️</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
          RecyLink
        </h1>
      </div>

      {/* 🔹 Navigation Menu */}
      <nav className="hidden md:flex space-x-8 text-gray-700 font-medium items-center">
        {[
          { label: "Home", path: "/" },
          { label: "Features", path: "/#features" },
          { label: "About", path: "/#about" },
          { label: "Contact", path: "/#contact" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="hover:text-emerald-600 transition-all duration-300 hover:font-semibold"
          >
            {item.label}
          </a>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Log Out
        </motion.button>
      </nav>

      {/* 🔹 Mobile Menu Button */}
      <button
        className="md:hidden text-gray-600 text-2xl"
        onClick={() => alert("Mobile menu coming soon!")}
      >
        ☰
      </button>
    </motion.header>
  );
}
