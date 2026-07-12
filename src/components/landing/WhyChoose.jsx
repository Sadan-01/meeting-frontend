import {
  FaClock,
  FaBullseye,
  FaShieldAlt,
  FaChartLine,
  FaBrain,
  FaCloud,
} from "react-icons/fa";

const benefits = [
  {
    icon: <FaClock />,
    title: "Save Hours Every Week",
    description:
      "Let AI handle note-taking so your team can focus on meaningful discussions.",
  },
  {
    icon: <FaBullseye />,
    title: "Never Miss Action Items",
    description:
      "Automatically detect tasks, deadlines, and responsibilities from every meeting.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure & Private",
    description:
      "Your meeting recordings and transcripts remain safe with enterprise-grade security.",
  },
  {
    icon: <FaChartLine />,
    title: "Boost Productivity",
    description:
      "Spend less time writing notes and more time making decisions.",
  },
  {
    icon: <FaBrain />,
    title: "Powered by AI",
    description:
      "Generate summaries, insights, and intelligent meeting analysis in seconds.",
  },
  {
    icon: <FaCloud />,
    title: "Access Anywhere",
    description:
      "Upload and review meetings from any device, anytime.",
  },
];

const WhyChoose = () => {
  return (
    <section id="why-choose" className="why-section">

      <div className="section-header">

        <span className="section-badge">
          ⭐ Why Choose Us
        </span>

        <h2>
          Why Teams Love
          <span> MeetMind AI</span>
        </h2>

        <p>
          Everything you need to make meetings smarter,
          faster and more productive.
        </p>

      </div>

      <div className="why-grid">

        {benefits.map((item, index) => (

          <div className="why-card" key={index}>

            <div className="why-icon">
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

          </div>

        ))}

      </div>

    </section>
  );
};

export default WhyChoose;