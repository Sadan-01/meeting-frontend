// import { motion } from "framer-motion";
// import {
//   FaArrowRight,
//   FaPlay,
//   FaMicrophone,
//   FaRobot,
//   FaChartLine,
// } from "react-icons/fa";
// import CountUp from "react-countup";
import React from "react";

const Hero = ({ onGetStarted }) => {
  return (
    <section className="hero-section">
      <div className="hero-container">

        {/* Left Side */}
        <div className="hero-content">

          <span className="hero-badge">
            ✨ AI-Powered Meeting Intelligence
          </span>

          <h1>
            AI That Turns Meetings
            <span> Into Actionable Knowledge</span>
          </h1>

          <p>
            Automatically transcribe meetings, generate summaries,
            extract action items, and gain AI-powered insights.
          </p>

          <div className="hero-buttons">
            <button
                className="start-btn"
                onClick={onGetStarted}
            >
                Get Started
            </button>

            <button className="demo-btn">
              Watch Demo
            </button>
          </div>

        </div>

        {/* Right Side */}
        <div className="hero-preview">

          <div className="dashboard-card">

            <div className="dashboard-top">

              <div>
                <h3>Meeting Dashboard</h3>
                <p>Weekly Sprint Review.mp3</p>
              </div>

              <span className="live-status">
                  Live
              </span>

            </div>

            <div className="upload-progress">

              <div className="progress-header">
                <span>AI Processing</span>
                <span>100%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>

            </div>

            <div className="summary-card">

              <h4>AI Summary</h4>

              <p>
                Sprint planning completed successfully.
                Three new features approved for the next
                release and deployment scheduled for Friday.
              </p>

            </div>

            <div className="action-list">

              <h4>Action Items</h4>

              <div>✅ Finish landing page UI</div>
              <div>✅ Review backend API</div>
              <div>✅ Schedule client demo</div>

            </div>

            <div className="analytics-row">

              <div>
                <strong>42m</strong>
                <span>Duration</span>
              </div>

              <div>
                <strong>4</strong>
                <span>Speakers</span>
              </div>

              <div>
                <strong>99%</strong>
                <span>Accuracy</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;