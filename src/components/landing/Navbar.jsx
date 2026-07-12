import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="landing-navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="landing-nav-container">

        {/* Logo */}
        <div className="landing-logo">
          <div className="landing-logo-icon">M</div>
          <span>MeetingMind</span>
        </div>

        {/* Desktop Menu */}
        <ul className="landing-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <a href="#why-choose">Why Choose</a>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>



        {/* Mobile Menu Icon */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>

      {menuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#why-choose">Why Choose</a>
          <li><a href="#faq">FAQ</a></li>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <button className="login-btn">
            Login
          </button>

          <button className="start-btn">
            Get Started
          </button>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;