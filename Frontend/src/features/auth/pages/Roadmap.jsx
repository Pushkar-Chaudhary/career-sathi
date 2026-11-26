import { useState } from "react";
import { Link } from "react-router-dom";
import { createCareerRoadmap } from "../services/auth.api";

const initialForm = { goal: "", currentLevel: "", skills: "", weeklyHours: "5" };

function Roadmap() {
  const [form, setForm] = useState(initialForm);
  const [consentToAI, setConsentToAI] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onGenerate = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const { roadmap: generated } = await createCareerRoadmap({ ...form, weeklyHours: Number(form.weeklyHours), consentToAI });
      setRoadmap(generated);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create your roadmap. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <main className="career-page workspace-page">
      <header className="page-intro"><p className="eyebrow">YOUR CAREER ROADMAP</p><h1>Turn your goal into a plan.</h1><p>Get a practical sequence of steps based on where you are now, the role you want, and the time you can set aside.</p></header>
      <section className="career-card roadmap-builder" aria-labelledby="roadmap-form-title">
        <h2 id="roadmap-form-title">Tell us where you want to go</h2>
        <form className="roadmap-form" onSubmit={onGenerate}>
          <label className="roadmap-field-wide">Target role or career goal<input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} maxLength={160} placeholder="e.g. Junior data analyst" required /></label>
          <label>Where are you starting?<textarea value={form.currentLevel} onChange={(event) => setForm({ ...form, currentLevel: event.target.value })} maxLength={3000} rows={4} placeholder="Your background, experience, or current stage" required /></label>
          <label>Skills and interests<textarea value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} maxLength={3000} rows={4} placeholder="What you know, enjoy, or want to learn" /></label>
          <label>Time available each week<select value={form.weeklyHours} onChange={(event) => setForm({ ...form, weeklyHours: event.target.value })}><option value="2">About 2 hours</option><option value="5">About 5 hours</option><option value="10">About 10 hours</option><option value="15">15+ hours</option></select></label>
          <label className="ai-consent roadmap-field-wide"><input type="checkbox" checked={consentToAI} onChange={(event) => setConsentToAI(event.target.checked)} required /><span>I confirm I am 18 or older and agree to send these details to Google Gemini. <Link to="/privacy" target="_blank" rel="noreferrer">Privacy details</Link></span></label>
          {error && <p className="form-error roadmap-field-wide" role="alert">{error}</p>}
          <button className="primary-btn roadmap-field-wide" type="submit" disabled={busy || !consentToAI || !form.goal.trim() || !form.currentLevel.trim()}>{busy ? "Planning your next steps…" : "Create my roadmap"}</button>
          {busy && <p className="muted-copy roadmap-field-wide" role="status">Building a realistic plan around your goal and available time…</p>}
        </form>
      </section>
      {roadmap && <RoadmapResult roadmap={roadmap} weeklyHours={form.weeklyHours} />}
      <footer className="career-footer"><Link to="/privacy">Privacy policy</Link></footer>
    </main>
  );
}

function RoadmapResult({ roadmap, weeklyHours }) {
  return (
    <section className="career-card roadmap-result" aria-labelledby="roadmap-result-title">
      <p className="eyebrow">YOUR PERSONAL PLAN · {weeklyHours}+ HOURS A WEEK</p>
      <h2 id="roadmap-result-title">A path toward your goal</h2>
      <p className="report-summary">{roadmap.summary}</p>
      <ol className="roadmap-stages">{roadmap.stages.map((stage, index) => <li className="roadmap-stage" key={`${stage.title}-${index}`}><span className="roadmap-stage-number">{String(index + 1).padStart(2, "0")}</span><div><p className="roadmap-duration">{stage.duration}</p><h3>{stage.title}</h3><p>{stage.outcome}</p><ul>{stage.actions.map((action, actionIndex) => <li key={`${index}-${actionIndex}`}>{action}</li>)}</ul></div></li>)}</ol>
      <div className="roadmap-bottom-grid">
        <section className="roadmap-subsection"><h3>Weekly rhythm</h3><ul>{roadmap.weeklyRhythm.map((item, index) => <li key={`${item.focus}-${index}`}><strong>{item.time}</strong><span>{item.focus}: {item.action}</span></li>)}</ul></section>
        <section className="roadmap-subsection"><h3>Progress milestones</h3><ol>{roadmap.milestones.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol></section>
      </div>
      <p className="roadmap-note">Use this as a flexible guide. Hiring timelines and requirements vary by role, employer, and location.</p>
    </section>
  );
}

export default Roadmap;
