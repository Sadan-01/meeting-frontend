import {
  FaBrain,
  FaLock,
  FaBolt,
  FaCloud,
} from "react-icons/fa";

const About = () => {
  return (
    <section id="about" className="about-section">

      <div className="about-content">

        <div className="about-left">

          <span className="section-badge">
            💡 About Us
          </span>

          <h2>
            Building Smarter
            <span> Meetings with AI</span>
          </h2>

          <p>
            MeetMind AI was created to eliminate manual note-taking
            and help teams focus on conversations instead of documentation.
            Our AI automatically transforms meeting recordings into
            searchable transcripts, concise summaries, actionable tasks,
            and valuable insights.
          </p>

          <div className="about-features">

            <div className="about-feature">
              <FaBrain />
              <span>AI Powered</span>
            </div>

            <div className="about-feature">
              <FaBolt />
              <span>Fast Processing</span>
            </div>

            <div className="about-feature">
              <FaLock />
              <span>Secure Storage</span>
            </div>

            <div className="about-feature">
              <FaCloud />
              <span>Cloud Access</span>
            </div>

          </div>

        </div>

        <div className="about-right">

          <div className="about-card">

            <h3>Our Mission</h3>

            <p>
              Help every team save time, improve collaboration,
              and never miss important decisions by using AI to
              simplify meetings.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default About;