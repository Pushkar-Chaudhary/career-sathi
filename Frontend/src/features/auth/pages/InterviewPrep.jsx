import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createInterviewReport, deleteInterviewReport, getInterviewReports } from "../services/auth.api";

const blank = { jobDescription: "", resume: "", selfDescription: "" };
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));

function InterviewPrep() {
  const [form, setForm] = useState(blank);
  const [consentToAI, setConsentToAI] = useState(false);
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getInterviewReports().then(({ reports: saved }) => {
      if (!active) return;
      setReports(saved);
      setReport(saved[0] || null);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Could not load saved interview reports.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const onGenerate = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const { report: created } = await createInterviewReport({ ...form, consentToAI });
      setReport(created);
      setReports((current) => [created, ...current.filter((item) => item._id !== created._id)].slice(0, 20));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not generate interview practice. Please try again.");
    } finally { setBusy(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this report and its saved job and resume text?")) return;
    setError("");
    try {
      await deleteInterviewReport(id);
      const remaining = reports.filter((item) => item._id !== id);
      setReports(remaining);
      if (report?._id === id) setReport(remaining[0] || null);
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not delete this report."); }
  };

  return (
    <main className="career-page workspace-page">
      <header className="page-intro"><p className="eyebrow">INTERVIEW PRACTICE</p><h1>Prepare for the questions that matter.</h1><p>Share the role and your experience to get tailored questions, answer guidance, and a skill check.</p></header>
      <div className="prep-layout">
        <section className="career-card" aria-labelledby="interview-form-title">
          <h2 id="interview-form-title">Build your practice set</h2>
          <form className="report-form" onSubmit={onGenerate}>
            <label htmlFor="prep-job">Job description <span>Required</span></label>
            <textarea id="prep-job" value={form.jobDescription} onChange={(event) => setForm({ ...form, jobDescription: event.target.value })} maxLength={20000} rows={8} placeholder="Paste the job posting or list its main requirements…" required />
            <label htmlFor="prep-resume">Your resume <span>Required</span></label>
            <textarea id="prep-resume" value={form.resume} onChange={(event) => setForm({ ...form, resume: event.target.value })} maxLength={20000} rows={8} placeholder="Paste your resume text. Remove details you don't want to share." required />
            <label htmlFor="prep-about">Additional context <span>Optional</span></label>
            <textarea id="prep-about" value={form.selfDescription} onChange={(event) => setForm({ ...form, selfDescription: event.target.value })} maxLength={5000} rows={4} placeholder="Goals, projects, or experience not covered in your resume." />
            <label className="ai-consent"><input type="checkbox" checked={consentToAI} onChange={(event) => setConsentToAI(event.target.checked)} required /><span>I confirm I am 18 or older and agree to send these details to Google Gemini. <Link to="/privacy" target="_blank" rel="noreferrer">Privacy details</Link></span></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-btn" type="submit" disabled={busy || !consentToAI || !form.jobDescription.trim() || !form.resume.trim()}>{busy ? "Creating your questions…" : "Generate interview questions"}</button>
            {busy && <p className="muted-copy" role="status">Generating role specific practice and answer guidance…</p>}
          </form>
        </section>
        <aside className="career-card report-history" aria-labelledby="saved-reports-title">
          <p className="eyebrow">YOUR LIBRARY</p><h2 id="saved-reports-title">Saved practice sets</h2>
          {loading && <p className="muted-copy">Loading your saved sets…</p>}
          {!loading && !reports.length && <p className="muted-copy">Your generated practice sets will be saved here.</p>}
          {reports.map((item) => <div className="history-row" key={item._id}><button className={`history-item${report?._id === item._id ? " is-selected" : ""}`} type="button" onClick={() => setReport(item)}><span>{item.jobDescription.slice(0, 100)}{item.jobDescription.length > 100 ? "…" : ""}</span><small>{formatDate(item.createdAt)} · {item.matchScore}% match</small></button><button className="history-delete" type="button" onClick={() => onDelete(item._id)}>Delete</button></div>)}
        </aside>
      </div>
      {report && <InterviewReport report={report} />}
      <footer className="career-footer"><Link to="/privacy">Privacy policy</Link></footer>
    </main>
  );
}

function InterviewReport({ report }) {
  return (
    <section className="career-card generated-report" aria-labelledby="practice-result-title">
      <div className="report-heading"><div><p className="eyebrow">YOUR PRACTICE SET</p><h2 id="practice-result-title">{report.matchScore}% role match</h2></div><span className="report-date">Created {formatDate(report.createdAt)}</span></div>
      {report.summary && <p className="report-summary">{report.summary}</p>}
      <div className="report-grid">
        <section className="report-section"><h3>Technical questions</h3>{report.technicalQuestions?.map((item, index) => <article className="question-card" key={`technical-${index}`}><h4>{index + 1}. {item.question}</h4><p><strong>What it tests:</strong> {item.intention}</p><p><strong>Answer direction:</strong> {item.answer}</p></article>)}</section>
        <section className="report-section"><h3>Behavioral questions</h3>{report.behavioralQuestions?.map((item, index) => <article className="question-card" key={`behavioral-${index}`}><h4>{index + 1}. {item.question}</h4><p><strong>What it tests:</strong> {item.intention}</p><p><strong>Answer direction:</strong> {item.answer}</p></article>)}</section>
        <section className="report-section"><h3>Skills to strengthen</h3>{report.skillGaps?.length ? <ul className="skill-gap-list">{report.skillGaps.map((gap, index) => <li key={`${gap.skill}-${index}`}><span>{gap.skill}</span><span className={`severity severity-${gap.severity}`}>{gap.severity}</span></li>)}</ul> : <p className="muted-copy">No major gaps were identified from the details provided.</p>}</section>
      </div>
      <Link className="roadmap-inline-link" to="/roadmap">Build a longer term career roadmap <span aria-hidden="true">→</span></Link>
    </section>
  );
}

export default InterviewPrep;
