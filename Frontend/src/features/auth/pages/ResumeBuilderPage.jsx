import { Link } from "react-router-dom";
import AIResumeBuilder from "./AIResumeBuilder";

function ResumeBuilderPage() {
  return (
    <main className="career-page workspace-page">
      <header className="page-intro"><p className="eyebrow">RESUME BUILDER</p><h1>Show the value of your experience.</h1><p>Build a clear first draft from your real experience, then review and edit every detail.</p></header>
      <AIResumeBuilder />
      <footer className="career-footer"><Link to="/privacy">Privacy policy</Link></footer>
    </main>
  );
}

export default ResumeBuilderPage;
