// src/pages/LandingPage.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 text-gray-800 min-h-screen flex flex-col font-sans overflow-hidden">
      {/* 🔹 Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-6 lg:px-16 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-emerald-100"
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-xl">
            <span className="text-white text-2xl">🗑️</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            RecyLink
          </h1>
        </div>

        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium items-center">
          {["Home", "Features", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-emerald-600 transition-all duration-300 hover:font-semibold"
            >
              {item}
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

        <button className="md:hidden text-gray-600 text-2xl">☰</button>
      </motion.header>

      {/* 🌍 Hero Section */}
      <section
        id="home"
        className="relative flex flex-col items-center justify-center text-center flex-grow py-20 px-6 min-h-screen"
      >
        {/* Background Accent Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight"
          >
            Smarter <span className="text-emerald-600">Waste.</span>
            <br />
            Cleaner <span className="text-green-600">Future.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gray-600 text-xl md:text-2xl max-w-3xl mb-12 leading-relaxed font-light"
          >
            Empower your community with real-time waste tracking, digital bin registration, 
            and data-driven analytics for a sustainable tomorrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(5, 150, 105, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold flex items-center gap-3"
            >
              🚀 Register Your Bin
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-emerald-500 text-emerald-600 text-lg px-10 py-4 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-semibold"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ♻️ Features */}
      <section id="features" className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Key Features of <span className="text-emerald-600">Smart Waste</span>
          </motion.h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Designed for smarter cities and cleaner communities — powered by innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              icon: "🔖",
              title: "Register Bins",
              description:
                "Easily register new bins with unique IDs and link them to your digital account.",
            },
            {
              icon: "📡",
              title: "Monitor Status",
              description:
                "Track bin fill levels, connectivity, and performance through a live dashboard.",
            },
            {
              icon: "📊",
              title: "Reports & Analytics",
              description:
                "Generate detailed reports on waste collection and recycling efficiency.",
            },
            {
              icon: "🧭",
              title: "Smart Routing",
              description:
                "Optimize collection routes to save time, fuel, and operational costs.",
            },
            {
              icon: "🔔",
              title: "Automated Alerts",
              description:
                "Get instant notifications for bin full status or connection errors.",
            },
            {
              icon: "🌱",
              title: "Eco Insights",
              description:
                "View your environmental contribution with carbon and recycling analytics.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="group p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-emerald-200 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🌿 About */}
      <section id="about" className="py-24 px-6 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Building Sustainable Cities Together
          </h3>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
            Our mission is to create a cleaner planet through technology and collaboration. 
            Smart Waste empowers residents, businesses, and authorities to manage waste efficiently, 
            promote recycling, and build eco-conscious communities.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 mt-6"
          >
            {["Efficiency", "Transparency", "Sustainability", "Community Impact"].map(
              (value, index) => (
                <div
                  key={index}
                  className="bg-white border border-emerald-100 rounded-2xl px-8 py-4 shadow-md hover:shadow-lg transition-all duration-300 text-emerald-700 font-semibold"
                >
                  {value}
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* 📞 Contact CTA */}
      <section
        id="contact"
        className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-green-700 text-white text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Join the Smart Waste Revolution ♻️
          </h3>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Collaborate with us to build greener cities — register your bins and start monitoring waste responsibly today.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            className="bg-white text-emerald-600 text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
          >
            Register Now
          </motion.button>
        </div>
      </section>

      {/* 🔻 Footer */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p className="text-gray-400 text-sm">
          © 2025 Smart Waste Management System | Designed by Group 13 🌿
        </p>
      </footer>
    </div>
  );
}
