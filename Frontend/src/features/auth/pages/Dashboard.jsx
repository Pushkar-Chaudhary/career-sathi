import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createInterviewReport, deleteInterviewReport, getInterviewReports } from "../services/auth.api";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplicationStatus,
} from "../services/applications.api";
import { Link } from "react-router-dom";
import AIResumeBuilder from "./AIResumeBuilder";
import CareerGuide from "./CareerGuide";

const APPLICATION_STATUSES = ["saved", "applied", "interviewing", "offer", "rejected"];

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Dashboard() {
  const { user, handleLogout, loading } = useAuth();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [consentToAI, setConsentToAI] = useState(false);
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationForm, setApplicationForm] = useState({ role: "", company: "", jobUrl: "", notes: "" });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [deletingReportId, setDeletingReportId] = useState("");
  const activeApplications = applications.filter((application) => ["applied", "interviewing"].includes(application.status)).length;

  useEffect(() => {
    let active = true;
    getInterviewReports()
      .then(({ reports: savedReports }) => {
        if (!active) return;
        setReports(savedReports);
        if (savedReports.length) setReport(savedReports[0]);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load your reports.");
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    getApplications()
      .then(({ applications: savedApplications }) => setApplications(savedApplications))
      .catch((err) => setApplicationError(err.response?.data?.message || "Could not load your applications."));
  }, []);

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  };

  const onGenerateReport = async (event) => {
    event.preventDefault();
    setError("");
    setGenerating(true);

    try {
      const { report: newReport } = await createInterviewReport({
        jobDescription,
        resume,
        selfDescription,
        consentToAI,
      });
      setReport(newReport);
      setReports((current) => [newReport, ...current.filter((item) => item._id !== newReport._id)].slice(0, 20));
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate a report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const onAddApplication = async (event) => {
    event.preventDefault();
    setApplicationError("");
    try {
      const { application } = await createApplication(applicationForm);
      setApplications((current) => [application, ...current]);
      setApplicationForm({ role: "", company: "", jobUrl: "", notes: "" });
    } catch (err) {
      setApplicationError(err.response?.data?.message || "Could not save this application.");
    }
  };

  const onChangeApplicationStatus = async (application, status) => {
    setApplicationError("");
    try {
      const { application: updated } = await updateApplicationStatus(application._id, status);
      setApplications((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (err) {
      setApplicationError(err.response?.data?.message || "Could not update this application.");
    }
  };

  const onDeleteApplication = async (id) => {
    setApplicationError("");
    try {
      await deleteApplication(id);
      setApplications((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setApplicationError(err.response?.data?.message || "Could not remove this application.");
    }
  };

  const onDeleteReport = async (id) => {
    if (!window.confirm("Delete this report and its saved job and resume text?")) return;
    setError("");
    setDeletingReportId(id);
    try {
      await deleteInterviewReport(id);
      const remaining = reports.filter((item) => item._id !== id);
      setReports(remaining);
      if (report?._id === id) setReport(remaining[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove this report.");
    } finally {
      setDeletingReportId("");
    }
  };

  return (
    <main className="career-page">
      <header className="career-header">
        <div className="career-header-copy">
          <span className="brand-mark"><span className="brand-monogram">CS</span>Career Sathi</span>
          <p className="eyebrow">YOUR CAREER WORKSPACE</p>
          <h1>Make your next move with confidence.</h1>
          <p>Welcome back, {user?.username}. Turn your experience into a clear plan for what comes next.</p>
        </div>
        <div className="career-header-actions">
          <a className="secondary-btn" href="#resume-builder">Build a resume <span aria-hidden="true">✦</span></a>
          <a className="secondary-btn" href="#applications">Track applications <span aria-hidden="true">Go</span></a>
          <button className="secondary-btn" type="button" onClick={onLogout} disabled={loading}>
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <section className="dashboard-stats" aria-label="Career workspace overview">
        <article className="stat-card stat-card-primary">
          <span className="stat-icon" aria-hidden="true">01</span>
          <div><strong>{reports.length}</strong><span>Interview reports</span></div>
          <small>Saved for your next step</small>
        </article>
        <article className="stat-card">
          <span className="stat-icon" aria-hidden="true">02</span>
          <div><strong>{applications.length}</strong><span>Opportunities tracked</span></div>
          <small>Across your job search</small>
        </article>
        <article className="stat-card">
          <span className="stat-icon" aria-hidden="true">03</span>
          <div><strong>{activeApplications}</strong><span>In progress</span></div>
          <small>Applied or interviewing</small>
        </article>
      </section>

      <div className="career-layout">
        <section className="career-card report-form-card" id="interview-prep">
          <p className="eyebrow">01 / INTERVIEW PREP</p>
          <h2>Create an interview report</h2>
          <p className="muted-copy">Paste the job posting and resume text. Your report is saved to your account.</p>
          <form className="report-form" onSubmit={onGenerateReport}>
            <label htmlFor="job-description">Job description <span>Required</span></label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job posting, including responsibilities and requirements..."
              maxLength={20000}
              rows={8}
              required
            />

            <label htmlFor="resume">Resume text <span>Required</span></label>
            <textarea
              id="resume"
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="Paste your resume text..."
              maxLength={20000}
              rows={8}
              required
            />

            <label htmlFor="self-description">A little more about you <span>Optional</span></label>
            <textarea
              id="self-description"
              value={selfDescription}
              onChange={(event) => setSelfDescription(event.target.value)}
              placeholder="Add career goals, relevant projects, or experience not shown on your resume."
              maxLength={5000}
              rows={4}
            />

            <label className="ai-consent">
              <input type="checkbox" checked={consentToAI} onChange={(event) => setConsentToAI(event.target.checked)} required />
              <span>I confirm I am 18 or older and understand this job description, resume, and optional self-description will be sent to Google Gemini to create my report.</span>
            </label>
            <p className="ai-consent-link"><Link to="/privacy" target="_blank" rel="noreferrer">Read the privacy policy.</Link></p>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-btn" type="submit" disabled={generating || !jobDescription.trim() || !resume.trim() || !consentToAI}>
              {generating ? "Building your report..." : "Analyze role and build my plan"}
            </button>
            {generating && <p className="muted-copy" role="status">Gemini is comparing your experience with the role. This can take a little while.</p>}
          </form>
        </section>

        <aside className="career-card report-history" aria-labelledby="history-title">
          <p className="eyebrow">YOUR LIBRARY</p>
          <h2 id="history-title">Your reports</h2>
          {loadingHistory && <p className="muted-copy">Loading saved reports...</p>}
          {!loadingHistory && reports.length === 0 && <p className="muted-copy">Your generated reports will appear here.</p>}
          {reports.map((savedReport) => (
            <div className="history-row" key={savedReport._id}>
              <button
                className={`history-item${report?._id === savedReport._id ? " is-selected" : ""}`}
                type="button"
                onClick={() => { setReport(savedReport); setError(""); }}
              >
                <span>{savedReport.jobDescription.slice(0, 100)}{savedReport.jobDescription.length > 100 ? "..." : ""}</span>
                <small>{formatDate(savedReport.createdAt)} | {savedReport.matchScore}% match</small>
              </button>
              <button className="history-delete" type="button" onClick={() => onDeleteReport(savedReport._id)} disabled={deletingReportId === savedReport._id}>
                {deletingReportId === savedReport._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </aside>
      </div>

      <AIResumeBuilder />

      <section className="career-card applications-card" id="applications" aria-labelledby="applications-title">
        <div className="application-heading">
          <div>
            <p className="eyebrow">Opportunity tracker</p>
            <h2 id="applications-title">Job applications</h2>
          </div>
          <span className="application-count">{applications.length} tracked</span>
        </div>
        <form className="application-form" onSubmit={onAddApplication}>
          <label>
            Job title
            <input maxLength={160} value={applicationForm.role} onChange={(event) => setApplicationForm({ ...applicationForm, role: event.target.value })} required />
          </label>
          <label>
            Company
            <input maxLength={160} value={applicationForm.company} onChange={(event) => setApplicationForm({ ...applicationForm, company: event.target.value })} required />
          </label>
          <label>
            Job link <span>Optional</span>
            <input type="url" placeholder="https://" maxLength={2000} value={applicationForm.jobUrl} onChange={(event) => setApplicationForm({ ...applicationForm, jobUrl: event.target.value })} />
          </label>
          <label>
            Notes <span>Optional</span>
            <input maxLength={3000} placeholder="Contact, follow-up, or other notes" value={applicationForm.notes} onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })} />
          </label>
          <button className="primary-btn" type="submit">Save opportunity</button>
        </form>
        {applicationError && <p className="form-error" role="alert">{applicationError}</p>}
        {applications.length ? (
          <div className="application-list">
            {applications.map((application) => (
              <article className="application-item" key={application._id}>
                <div className="application-details">
                  <h3>{application.role} <span>at {application.company}</span></h3>
                  {application.jobUrl && <a href={application.jobUrl} target="_blank" rel="noreferrer">View job posting</a>}
                  {application.notes && <p>{application.notes}</p>}
                  <small>Updated {formatDate(application.updatedAt)}</small>
                </div>
                <div className="application-actions">
                  <label>
                    Status
                    <select value={application.status} onChange={(event) => onChangeApplicationStatus(application, event.target.value)}>
                      {APPLICATION_STATUSES.map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                    </select>
                  </label>
                  <button className="text-button" type="button" onClick={() => onDeleteApplication(application._id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="muted-copy">Save a role here to keep track of your applications.</p>}
      </section>

      {report && <InterviewReport report={report} />}
      <CareerGuide />
      <footer className="career-footer"><Link to="/privacy">Privacy policy</Link></footer>
    </main>
  );
}

function InterviewReport({ report }) {
  return (
    <section className="career-card generated-report" aria-labelledby="report-title">
      <div className="report-heading">
        <div>
          <p className="eyebrow">Interview preparation report</p>
          <h2 id="report-title">Your role match</h2>
        </div>
        <div className="match-score" aria-label={`${report.matchScore} percent match`}>
          <strong>{report.matchScore}%</strong>
          <span>match</span>
        </div>
      </div>

      {report.summary && <p className="report-summary">{report.summary}</p>}

      <div className="report-grid">
        <section className="report-section">
          <h3>Technical interview questions</h3>
          {report.technicalQuestions?.map((item, index) => (
            <article className="question-card" key={`technical-${index}`}>
              <h4>{index + 1}. {item.question}</h4>
              <p><strong>What it tests:</strong> {item.intention}</p>
              <p><strong>Answer guidance:</strong> {item.answer}</p>
            </article>
          ))}
        </section>

        <section className="report-section">
          <h3>Behavioral interview questions</h3>
          {report.behavioralQuestions?.map((item, index) => (
            <article className="question-card" key={`behavioral-${index}`}>
              <h4>{index + 1}. {item.question}</h4>
              <p><strong>What it tests:</strong> {item.intention}</p>
              <p><strong>Answer guidance:</strong> {item.answer}</p>
            </article>
          ))}
        </section>

        <section className="report-section">
          <h3>Skills to strengthen</h3>
          {report.skillGaps?.length ? (
            <ul className="skill-gap-list">
              {report.skillGaps.map((gap, index) => (
                <li key={`${gap.skill}-${index}`}>
                  <span>{gap.skill}</span>
                  <span className={`severity severity-${gap.severity}`}>{gap.severity}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted-copy">No major gaps were identified from the information provided.</p>}
        </section>

        <section className="report-section">
          <h3>7-day preparation plan</h3>
          <ol className="preparation-plan">
            {report.preparationPlan?.map((day) => (
              <li key={day.day}>
                <h4>Day {day.day}: {day.focus}</h4>
                <ul>{day.tasks.map((task, index) => <li key={`${day.day}-${index}`}>{task}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <p className="report-date">Generated {formatDate(report.createdAt)}</p>
    </section>
  );
}

export default Dashboard;
