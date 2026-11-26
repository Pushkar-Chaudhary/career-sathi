import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInterviewReports } from "../services/auth.api";
import { createApplication, deleteApplication, getApplications, updateApplicationStatus } from "../services/applications.api";

const APPLICATION_STATUSES = ["saved", "applied", "interviewing", "offer", "rejected"];
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationForm, setApplicationForm] = useState({ role: "", company: "", jobUrl: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getInterviewReports(), getApplications()])
      .then(([reportData, applicationData]) => {
        if (!active) return;
        setReports(reportData.reports);
        setApplications(applicationData.applications);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load your workspace. Please refresh and try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const onAddApplication = async (event) => {
    event.preventDefault();
    setError(""); setBusy(true);
    try {
      const { application } = await createApplication(applicationForm);
      setApplications((current) => [application, ...current]);
      setApplicationForm({ role: "", company: "", jobUrl: "", notes: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save this application.");
    } finally { setBusy(false); }
  };

  const onChangeStatus = async (application, status) => {
    setError("");
    try {
      const { application: updated } = await updateApplicationStatus(application._id, status);
      setApplications((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not update this application."); }
  };

  const onDeleteApplication = async (id) => {
    if (!window.confirm("Remove this opportunity from your tracker?")) return;
    setError("");
    try {
      await deleteApplication(id);
      setApplications((current) => current.filter((item) => item._id !== id));
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not remove this application."); }
  };

  const activeApplications = applications.filter((item) => ["applied", "interviewing"].includes(item.status)).length;

  return (
    <main className="career-page workspace-page">
      <header className="page-intro home-intro">
        <p className="eyebrow">YOUR CAREER WORKSPACE</p>
        <h1>Make your next move with confidence.</h1>
        <p>Prepare for interviews, shape your resume, and keep your job search moving.</p>
      </header>
      <section className="dashboard-stats" aria-label="Career workspace overview">
        <article className="stat-card"><div><strong>{reports.length}</strong><span>Interview reports</span></div><small>Role specific practice</small></article>
        <article className="stat-card"><div><strong>{applications.length}</strong><span>Applications</span></div><small>Opportunities in your tracker</small></article>
        <article className="stat-card"><div><strong>{activeApplications}</strong><span>In progress</span></div><small>Applied or interviewing</small></article>
      </section>
      <section className="home-feature-grid" aria-label="Career tools">
        <Link className="home-feature-card" to="/interview-prep"><span className="feature-kicker">PRACTICE</span><h2>Interview questions</h2><p>Generate role specific questions and answer guidance from a job description.</p><span className="feature-arrow" aria-hidden="true">→</span></Link>
        <Link className="home-feature-card" to="/resume-builder"><span className="feature-kicker">BUILD</span><h2>Resume builder</h2><p>Turn your experience into a clear, editable resume draft.</p><span className="feature-arrow" aria-hidden="true">→</span></Link>
        <Link className="home-feature-card" to="/roadmap"><span className="feature-kicker">PLAN</span><h2>Career roadmap</h2><p>Get a practical plan with focused stages, actions, and milestones.</p><span className="feature-arrow" aria-hidden="true">→</span></Link>
      </section>
      {error && <p className="form-error workspace-error" role="alert">{error}</p>}
      <section className="career-card applications-card" id="applications" aria-labelledby="applications-title">
        <div className="application-heading"><div><p className="eyebrow">STAY ORGANIZED</p><h2 id="applications-title">Application tracker</h2></div><span className="application-count">{applications.length} tracked</span></div>
        <form className="application-form" onSubmit={onAddApplication}>
          <label>Job title<input maxLength={160} value={applicationForm.role} onChange={(event) => setApplicationForm({ ...applicationForm, role: event.target.value })} required /></label>
          <label>Company<input maxLength={160} value={applicationForm.company} onChange={(event) => setApplicationForm({ ...applicationForm, company: event.target.value })} required /></label>
          <label>Job link <span>Optional</span><input type="url" placeholder="https://" maxLength={2000} value={applicationForm.jobUrl} onChange={(event) => setApplicationForm({ ...applicationForm, jobUrl: event.target.value })} /></label>
          <label>Notes <span>Optional</span><input maxLength={3000} placeholder="Follow up next week" value={applicationForm.notes} onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })} /></label>
          <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Add application"}</button>
        </form>
        {applications.length ? <div className="application-list">{applications.map((application) => (
          <article className="application-item" key={application._id}>
            <div className="application-details"><h3>{application.role} <span>at {application.company}</span></h3>{application.jobUrl && <a href={application.jobUrl} target="_blank" rel="noreferrer">View job posting</a>}{application.notes && <p>{application.notes}</p>}<small>Updated {formatDate(application.updatedAt)}</small></div>
            <div className="application-actions"><label>Status<select value={application.status} onChange={(event) => onChangeStatus(application, event.target.value)}>{APPLICATION_STATUSES.map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><button className="text-button" type="button" onClick={() => onDeleteApplication(application._id)}>Remove</button></div>
          </article>
        ))}</div> : <p className="muted-copy">{loading ? "Loading your applications…" : "Add a role to keep your job search organized."}</p>}
      </section>
      <section className="career-card recent-reports" aria-labelledby="recent-reports-title">
        <div className="application-heading"><div><p className="eyebrow">YOUR PRACTICE</p><h2 id="recent-reports-title">Recent interview reports</h2></div><Link to="/interview-prep">Create a report</Link></div>
        {reports.length ? <ul>{reports.slice(0, 4).map((report) => <li key={report._id}><span>{report.jobDescription.slice(0, 130)}{report.jobDescription.length > 130 ? "…" : ""}</span><span>{report.matchScore}% match · {formatDate(report.createdAt)}</span></li>)}</ul> : <p className="muted-copy">Your generated practice reports will appear here.</p>}
      </section>
      <footer className="career-footer"><Link to="/privacy">Privacy policy</Link></footer>
    </main>
  );
}

export default Dashboard;
