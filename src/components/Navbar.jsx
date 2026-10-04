import { Link } from "react-router-dom";
import Button from "./ui/Button";
import SyncMark from "./ui/SyncMark";
import "./Navbar.css";

function Navbar({ onGetStarted }) {
  return (
    <header className="landing-nav-wrap">
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          <SyncMark size={26} />
          <span>SkillSync</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Why SkillSync</a>
        </div>

        <Button variant="accent" size="sm" onClick={onGetStarted}>
          Get started
        </Button>
      </nav>
    </header>
  );
}

export default Navbar;
