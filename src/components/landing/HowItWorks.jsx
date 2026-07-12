import {
  FaUpload,
  FaRobot,
  FaChartLine,
  FaShareAlt,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaUpload />,
    title: "Upload Meeting",
    description:
      "Upload your meeting audio or video in seconds.",
  },
  {
    icon: <FaRobot />,
    title: "AI Processing",
    description:
      "Our AI transcribes, summarizes and extracts action items.",
  },
  {
    icon: <FaChartLine />,
    title: "Review Insights",
    description:
      "Explore summaries, analytics and key decisions.",
  },
  {
    icon: <FaShareAlt />,
    title: "Export & Share",
    description:
      "Download reports or share them with your team.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-section">

      <div className="section-header">

        <span className="section-badge">
          🚀 Workflow
        </span>

        <h2>
          How MeetMind AI
          <span> Works</span>
        </h2>

        <p>
          From uploading a meeting to sharing AI-powered insights,
          everything happens in just four simple steps.
        </p>

      </div>

      <div className="steps-grid">

        {steps.map((step, index) => (

          <div className="step-card" key={index}>

            <div className="step-number">
              {index + 1}
            </div>

            <div className="step-icon">
              {step.icon}
            </div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

          </div>

        ))}

      </div>

    </section>
  );
};

export default HowItWorks;