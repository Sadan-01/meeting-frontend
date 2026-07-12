import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="contact-section">

      <div className="section-header">

        <span className="section-badge">
          📞 Contact
        </span>

        <h2>
          Let's Connect
        </h2>

        <p>
          Have questions, feedback, or ideas? We'd love to hear from you.
        </p>

      </div>

      <div className="contact-grid">

        <div className="contact-card">

          <FaEnvelope className="contact-icon" />
          <h3>Email</h3>
          <p>sadanahmad11227788@gmail.com</p>

        </div>

        <div className="contact-card">

          <FaPhoneAlt className="contact-icon" />
          <h3>Phone</h3>
          <p>+92 3216071421</p>

        </div>

        <div className="contact-card">

          <FaMapMarkerAlt className="contact-icon" />
          <h3>Location</h3>
          <p>Pakistan</p>

        </div>

      </div>

      <div className="social-links">

        <a href="https://www.linkedin.com/in/sadan-ahmad-079509286/">
          <FaLinkedin />
        </a>

      </div>

    </section>
  );
};

export default Contact;