import FeatureCard from "./FeatureCard";
import "./Features.css";

const ICONS = {
  match: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="15" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  chat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  growth: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 18 10 12 14 15 20 8M20 8h-5M20 8v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function Features() {
  return (
    <section className="features" id="features">
      <div className="features-head">
        <span className="section-eyebrow">Why SkillSync</span>
        <h2>Everything you need to learn from a peer, not a platform</h2>
      </div>

      <div className="features-grid">
        <FeatureCard
          index={0}
          icon={ICONS.match}
          title="Skill-aware matching"
          description="We weigh what you can teach against what you want to learn, plus department, year and schedule, to surface the classmate who actually fits."
        />

        <FeatureCard
          index={1}
          icon={ICONS.chat}
          title="Start talking instantly"
          description="Every match opens with an AI-suggested icebreaker and a first-session plan, so the conversation never starts from a blank page."
        />

        <FeatureCard
          index={2}
          icon={ICONS.growth}
          title="Track what you're building"
          description="Sessions, skills taught and skills learned all roll up into a simple profile you can point to when it's time to show your growth."
        />
      </div>
    </section>
  );
}

export default Features;
