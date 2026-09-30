import { useState } from "react";
import { Link } from "react-router-dom";
import { createResumeDraft } from "../services/auth.api";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  location: "",
  targetRole: "",
  experience: "",
  education: "",
  skills: "",
  jobDescription: "",
};

function AIResumeBuilder() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [consentToAI, setConsentToAI] = useState(false);
  const [draft, setDraft] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onBuild = async (event) => {
    event.preventDefault();
    setBuilding(true);
    setError("");
    setNotice("");
    try {
      const { resumeDraft } = await createResumeDraft({ profile, consentToAI });
      setDraft(resumeDraft);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not build your resume draft. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  const onDownload = () => {
    const filename = profile.targetRole.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "resume";
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Resume draft downloaded. Review every detail before using it.");
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setNotice("Resume draft copied to your clipboard.");
    } catch {
      setNotice("Copy is unavailable in this browser. You can select and copy the draft below.");
    }
  };

  return (
    <section className="career-card resume-builder-card" id="resume-builder" aria-labelledby="resume-builder-title">
      <div className="feature-heading">
        <div>
          <p className="eyebrow">02 / AI RESUME BUILDER</p>
          <h2 id="resume-builder-title">Build a resume for the role you want</h2>
          <p className="muted-copy">Share your real experience and get a polished, editable first draft. Nothing is saved to your account.</p>
        </div>
        <span className="feature-badge">Drafts are not saved</span>
      </div>

      <form className="resume-builder-form" onSubmit={onBuild}>
        <section className="resume-form-section" aria-labelledby="resume-basics-title">
          <div className="resume-section-heading">
            <span className="resume-step">01</span>
            <div><h3 id="resume-basics-title">Role and contact</h3><p>Start with your target role. Add the contact details you want on the resume.</p></div>
          </div>
          <div className="resume-fields-grid">
            <label className="resume-field-wide">
              <span className="resume-field-label">Target role <span className="field-hint is-required">Required</span></span>
              <input name="targetRole" value={profile.targetRole} onChange={updateField} maxLength={160} placeholder="e.g. Product designer" required />
            </label>
            <label>
              <span className="resume-field-label">Name <span className="field-hint">Optional</span></span>
              <input name="name" value={profile.name} onChange={updateField} maxLength={120} placeholder="Your name" />
            </label>
            <label>
              <span className="resume-field-label">Email <span className="field-hint">Optional</span></span>
              <input name="email" type="email" value={profile.email} onChange={updateField} maxLength={250} placeholder="you@example.com" />
            </label>
            <label>
              <span className="resume-field-label">Phone <span className="field-hint">Optional</span></span>
              <input name="phone" value={profile.phone} onChange={updateField} maxLength={80} placeholder="Phone number" />
            </label>
            <label>
              <span className="resume-field-label">Location <span className="field-hint">Optional</span></span>
              <input name="location" value={profile.location} onChange={updateField} maxLength={120} placeholder="City, country" />
            </label>
          </div>
        </section>

        <section className="resume-form-section" aria-labelledby="resume-experience-title">
          <div className="resume-section-heading">
            <span className="resume-step">02</span>
            <div><h3 id="resume-experience-title">Your experience</h3><p>Rough notes are fine. Add at least experience, education, or skills to get started.</p></div>
          </div>
          <div className="resume-fields-grid">
            <label className="resume-field-wide">
              <span className="resume-field-label">Work experience <span className="field-hint">Optional</span></span>
              <textarea name="experience" value={profile.experience} onChange={updateField} maxLength={12000} rows={6} placeholder="Roles, dates, responsibilities, projects, and results. Keep the details factual." />
            </label>
            <label>
              <span className="resume-field-label">Education <span className="field-hint">Optional</span></span>
              <textarea name="education" value={profile.education} onChange={updateField} maxLength={4000} rows={4} placeholder="Degrees, schools, dates, or relevant coursework" />
            </label>
            <label>
              <span className="resume-field-label">Skills <span className="field-hint">Optional</span></span>
              <textarea name="skills" value={profile.skills} onChange={updateField} maxLength={3000} rows={4} placeholder="Tools and strengths you can support with examples" />
            </label>
            <label className="resume-field-wide">
              <span className="resume-field-label">Job description <span className="field-hint">Optional</span></span>
              <textarea name="jobDescription" value={profile.jobDescription} onChange={updateField} maxLength={12000} rows={5} placeholder="Paste role requirements to tailor the draft. Leave out confidential information." />
            </label>
          </div>
        </section>

        <label className="ai-consent resume-field-wide resume-builder-consent">
          <input type="checkbox" checked={consentToAI} onChange={(event) => setConsentToAI(event.target.checked)} required />
          <span>I confirm I am 18 or older and agree to send these details to Google Gemini to create a resume draft. I will review it for accuracy.</span>
        </label>
        <p className="ai-consent-link resume-field-wide"><Link to="/privacy" target="_blank" rel="noreferrer">Read how AI handles your information.</Link></p>

        {error && <p className="form-error resume-field-wide" role="alert">{error}</p>}
        <div className="resume-submit-row resume-field-wide">
          <button className="primary-btn" type="submit" disabled={building || !consentToAI || !profile.targetRole.trim() || ![profile.experience, profile.education, profile.skills].some((value) => value.trim())}>
            {building ? "Building your draft..." : "Build my resume draft"}
          </button>
          <span>Usually takes a few seconds</span>
        </div>
        {building && <p className="muted-copy resume-field-wide" role="status">Organizing your experience into a clear, role-focused resume.</p>}
      </form>

      {draft && (
        <section className="resume-preview-panel" aria-labelledby="resume-preview-title">
          <div className="application-heading">
            <div><p className="eyebrow">YOUR FIRST DRAFT</p><h3 id="resume-preview-title">Review and refine</h3></div>
            <div className="resume-preview-actions">
              <button type="button" className="secondary-btn" onClick={onCopy}>Copy</button>
              <button type="button" className="primary-btn" onClick={onDownload}>Download .txt</button>
            </div>
          </div>
          <pre className="resume-preview">{draft}</pre>
          {notice && <p className="muted-copy" role="status">{notice}</p>}
          <p className="resume-review-note">AI can make mistakes. Check names, dates, skills, and every achievement before sharing this resume.</p>
        </section>
      )}
    </section>
  );
}

export default AIResumeBuilder;
