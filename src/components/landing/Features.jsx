import {
  FaMicrophone,
  FaFileAlt,
  FaCheckCircle,
  FaComments,
  FaChartBar,
  FaSearch,
} from "react-icons/fa";

const features = [
  {
    icon: <FaMicrophone />,
    title: "AI Transcription",
    description:
      "Convert meeting audio into highly accurate transcripts in seconds.",
  },
  {
    icon: <FaFileAlt />,
    title: "Smart Summaries",
    description:
      "Generate concise AI-powered summaries with key discussion points.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Action Items",
    description:
      "Automatically detect tasks, deadlines, and responsibilities.",
  },
  {
    icon: <FaComments />,
    title: "AI Chat",
    description:
      "Ask questions about any meeting and receive instant answers.",
  },
  {
    icon: <FaChartBar />,
    title: "Meeting Analytics",
    description:
      "Track speaker activity, meeting duration, and engagement insights.",
  },
  {
    icon: <FaSearch />,
    title: "Smart Search",
    description:
      "Search across all transcripts using natural language.",
  },
];

const Features = () => {
  return (
    <section id="features" className="features-section">

      <div className="section-header">

        <span className="section-badge">
          ✨ Features
        </span>

        <h2>
          Everything You Need
          <span> To Master Your Meetings</span>
        </h2>

        <p>
          MeetMind AI helps you record, transcribe, summarize,
          organize and search every meeting effortlessly.
        </p>

      </div>

      <div className="features-grid">

            {features.map((feature, index) => (

                <div className="feature-card" key={index}>

                    <div className="feature-icon">
                        {feature.icon}
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.description}</p>

                </div>

            ))}

      </div>

    </section>
  );
};

export default Features;