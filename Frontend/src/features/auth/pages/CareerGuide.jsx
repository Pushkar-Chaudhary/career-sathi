import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askCareerAssistant } from "../services/auth.api";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi! I can show you around Career Sathi, explain your interview report, help with resume questions, or talk through your job search.",
};

const QUICK_QUESTIONS = [
  "How do I build a resume?",
  "What is the match score?",
  "How do I track an application?",
];

function CareerGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [consentToAI, setConsentToAI] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endOfMessages = useRef(null);

  useEffect(() => {
    if (open) endOfMessages.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, open]);

  const onAsk = async (event) => {
    event.preventDefault();
    const content = question.trim();
    if (!content || !consentToAI || sending) return;

    const userMessage = { role: "user", content };
    const history = [...messages.slice(-10), userMessage];
    setMessages(history);
    setQuestion("");
    setError("");
    setSending(true);
    try {
      const { answer } = await askCareerAssistant({ messages: history, consentToAI });
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "I couldn't get an answer right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button className={`guide-launcher${open ? " is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="career-guide-panel">
        <span className="guide-launcher-icon" aria-hidden="true">{open ? "x" : "AI"}</span>
        <span>{open ? "Close guide" : "Ask Career Sathi"}</span>
      </button>

      {open && (
        <aside className="career-guide-panel" id="career-guide-panel" aria-label="Career Sathi guide">
          <header className="guide-header">
            <span className="guide-avatar" aria-hidden="true">CS</span>
            <div><strong>Your career guide</strong><span>App help and career questions</span></div>
            <button type="button" className="guide-close" onClick={() => setOpen(false)} aria-label="Close guide">x</button>
          </header>

          <div className="guide-messages" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <p className={`guide-message ${message.role === "user" ? "is-user" : "is-assistant"}`} key={`${message.role}-${index}`}>{message.content}</p>
            ))}
            {sending && <p className="guide-message is-assistant guide-typing" role="status">Thinking...</p>}
            <div ref={endOfMessages} />
          </div>

          {messages.length === 1 && (
            <div className="guide-quick-questions" aria-label="Suggested questions">
              {QUICK_QUESTIONS.map((item) => <button key={item} type="button" onClick={() => setQuestion(item)}>{item}</button>)}
            </div>
          )}

          {error && <p className="guide-error" role="alert">{error}</p>}
          <form className="guide-form" onSubmit={onAsk}>
            <label className="guide-consent">
              <input type="checkbox" checked={consentToAI} onChange={(event) => setConsentToAI(event.target.checked)} />
              <span>I am 18+ and agree to send my messages to Google Gemini. <Link to="/privacy" target="_blank" rel="noreferrer">Privacy</Link></span>
            </label>
            <div className="guide-composer">
              <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1500} placeholder="Ask about the app or your next step" aria-label="Your question" />
              <button type="submit" disabled={sending || !consentToAI || !question.trim()} aria-label="Send question">Send</button>
            </div>
            <small>Chats stay in this browser session and aren’t saved to your account.</small>
          </form>
        </aside>
      )}
    </>
  );
}

export default CareerGuide;
