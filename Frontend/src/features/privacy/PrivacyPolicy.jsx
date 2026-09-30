import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <Link className="privacy-brand" to="/">Career Sathi</Link>
        <Link to="/login">Sign in</Link>
      </header>

      <article className="privacy-card">
        <p className="eyebrow">Last updated September 30, 2026</p>
        <h1>Privacy policy</h1>
        <p className="privacy-intro">
          This notice explains what Career Sathi stores and how information is used in this application.
          It describes the current app behavior; the operator of a deployed copy is responsible for providing
          any additional contact details and terms that apply to that deployment.
        </p>

        <section>
          <h2>Information this app stores</h2>
          <ul>
            <li>Account name and email address. Passwords are stored as bcrypt hashes, not as readable passwords.</li>
            <li>Job titles, company names, job links, notes, and application statuses you save in the opportunity tracker.</li>
            <li>Job descriptions, resume text, optional self-description, and AI-generated interview reports you submit or create. Reports are saved to your account so you can view their history.</li>
            <li>Resume-builder details and in-app guide messages are sent to Google Gemini only when you submit them with consent. Resume drafts and guide conversations are not saved to your Career Sathi account; guide messages remain in the current browser session.</li>
            <li>A signed-in session cookie and a hashed session token record when you sign out.</li>
          </ul>
        </section>

        <section>
          <h2>How information is used</h2>
          <p>Account information is used to sign you in and keep your records associated with your account. Application details are used to show and update your opportunity tracker. Job descriptions, resume text, and an optional self-description are sent to Google Gemini to generate a role match, interview questions, skill gaps, and a preparation plan. Resume-builder details are sent to create an editable draft, and guide messages are sent to answer app and career questions. Resume-builder inputs and guide conversations are not saved in the app database.</p>
        </section>

        <section className="privacy-ai-notice">
          <h2>Before sending information to Gemini</h2>
          <p>The Gemini API terms require users of the API to be at least 18 years old. Each AI feature asks you to confirm that you meet this requirement before sending information.</p>
          <p>The Gemini API service tier used by a deployment can affect how Google handles prompts and responses. For unpaid service, Google says submitted content may be used to improve products and may be reviewed by people. For paid service, Google says prompts and responses are not used to improve products, but may still be logged for a limited time for abuse monitoring. This app does not show which tier the operator has enabled.</p>
          <p>Do not submit confidential, highly sensitive, or personal information you do not want processed by Google. Review the current <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Gemini API terms</a>, <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>, and <a href="https://ai.google.dev/gemini-api/docs/zdr" target="_blank" rel="noreferrer">Gemini API data retention information</a> before using AI features.</p>
        </section>

        <section>
          <h2>Storage and deletion</h2>
          <p>Saved reports and application records remain in the database configured by the app operator until you remove them or the operator deletes them. You can remove individual reports and application records from the dashboard. Removing a report deletes it from this app; it does not control any copy Google may retain under its API terms. This version has no self-service account deletion control; contact the operator of the site you use to request account and remaining app data deletion.</p>
        </section>

        <section>
          <h2>Security</h2>
          <p>The backend keeps the Gemini API key out of the browser, hashes account passwords, uses an HTTP-only session cookie, checks trusted origins on data-changing requests, and limits records to the signed-in account. Production cookies are marked Secure and require HTTPS. No online service can guarantee perfect security, so avoid submitting information you cannot risk exposing.</p>
        </section>

        <section>
          <h2>Cookies and third parties</h2>
          <p>This app uses a 24-hour session cookie to keep you signed in. The cookie is HTTP-only and, in production, marked Secure. It does not include analytics or advertising integrations in the current code. Interview-report inputs, resume-builder details, and guide messages are sent to Google Gemini when you consent; Google's handling is described in its terms and privacy information linked above.</p>
        </section>

        <section>
          <h2>Questions or requests</h2>
          <p>For access, correction, or deletion requests, contact the administrator responsible for the Career Sathi deployment you are using.</p>
        </section>

        <Link className="privacy-back-link" to="/">Back to Career Sathi</Link>
      </article>
    </main>
  );
}

export default PrivacyPolicy;
