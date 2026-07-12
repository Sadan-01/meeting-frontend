import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "How does MeetMind AI work?",
    answer:
      "Upload your meeting recording and MeetMind AI automatically transcribes it, generates summaries, extracts action items, and provides AI-powered insights.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "MeetMind AI supports common audio and video formats such as MP3, MP4, WAV, and M4A.",
  },
  {
    question: "Is my meeting data secure?",
    answer:
      "Yes. Your recordings and transcripts are stored securely and are only accessible to authorized users.",
  },
  {
    question: "Can I export summaries?",
    answer:
      "Yes. You can export meeting summaries and action items in multiple formats.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. MeetMind AI offers a free plan with essential features, and premium plans for advanced capabilities.",
  },
];

const FAQ = () => {

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">

      <div className="section-header">

        <span className="section-badge">
          ❓ FAQ
        </span>

        <h2>
          Frequently Asked
          <span> Questions</span>
        </h2>

        <p>
          Everything you need to know about MeetMind AI.
        </p>

      </div>

      <div className="faq-container">

        {faqs.map((faq, index) => (

          <div
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
            key={index}
          >

            <button
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >

              <span>{faq.question}</span>

              <FaChevronDown className="faq-icon" />

            </button>

            {activeIndex === index && (

              <div className="faq-answer">

                <p>{faq.answer}</p>

              </div>

            )}

          </div>

        ))}

      </div>

    </section>
  );
};

export default FAQ;