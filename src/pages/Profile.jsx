import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProfile, updateProfile } from "../services/api";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import PageTransition from "../components/ui/PageTransition";
import "./Profile.css";

function Field({ label, children }) {
  return (
    <label className="pf-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [skillsKnow, setSkillsKnow] = useState("");
  const [skillsLearn, setSkillsLearn] = useState("");

  const [learningStyle, setLearningStyle] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [language, setLanguage] = useState("");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [learningMode, setLearningMode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const user = res.data.user;

        setName(user.name || "");
        setCollege(user.college || "");
        setDepartment(user.department || "");
        setYear(user.year || "");

        setSkillsKnow((user.teaches || []).join(", "));
        setSkillsLearn((user.learns || []).join(", "));

        setLearningStyle(user.learningStyle || "");
        setPreferredTime(user.preferredTime || "");
        setLanguage(user.language || "");
        setMeetingPlace(user.location || "");
        setLearningMode(user.learningMode || "");
      } catch (err) {
        console.log(err);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        college,
        department,
        year,
        teaches: skillsKnow.split(",").map((s) => s.trim()).filter(Boolean),
        learns: skillsLearn.split(",").map((s) => s.trim()).filter(Boolean),
        learningStyle,
        preferredTime,
        language,
        learningMode,
        location: meetingPlace,
      });
      navigate("/loading");
    } catch (err) {
      console.log(err);
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <AppShell>
        <form className="pf" onSubmit={handleSubmit}>
          <motion.div
            className="pf-head"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="dash-eyebrow">Your profile</span>
            <h1>Tell SkillSync AI about yourself</h1>
            <p>We use this to rank the classmates who fit your skills, pace and schedule best.</p>
          </motion.div>

          <motion.section
            className="pf-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h2>Basics</h2>
            <div className="pf-row">
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </Field>
              <Field label="College">
                <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Your college" />
              </Field>
            </div>
            <div className="pf-row">
              <Field label="Department">
                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Select department</option>
                  <option>CSE</option>
                  <option>IT</option>
                  <option>ECE</option>
                  <option>EEE</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                  <option>AI & DS</option>
                  <option>Cyber Security</option>
                </select>
              </Field>
              <Field label="Year">
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Select year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </Field>
            </div>
          </motion.section>

          <motion.section
            className="pf-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2>Skills</h2>
            <Field label="Skills you can teach — separate with commas">
              <textarea
                value={skillsKnow}
                onChange={(e) => setSkillsKnow(e.target.value)}
                placeholder="React, Python, Java..."
              />
            </Field>
            <Field label="Skills you want to learn — separate with commas">
              <textarea
                value={skillsLearn}
                onChange={(e) => setSkillsLearn(e.target.value)}
                placeholder="AI, ML, UI/UX..."
              />
            </Field>
          </motion.section>

          <motion.section
            className="pf-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h2>Learning preferences</h2>
            <div className="pf-row three">
              <Field label="Learning style">
                <select value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)}>
                  <option value="">Select style</option>
                  <option>Visual</option>
                  <option>Hands-on</option>
                  <option>Reading</option>
                  <option>Project Based</option>
                </select>
              </Field>
              <Field label="Preferred time">
                <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
                  <option value="">Select time</option>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Night</option>
                </select>
              </Field>
              <Field label="Language">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="">Select language</option>
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                </select>
              </Field>
            </div>
            <div className="pf-row">
              <Field label="Preferred meeting place">
                <select value={meetingPlace} onChange={(e) => setMeetingPlace(e.target.value)}>
                  <option value="">Select place</option>
                  <option>Library</option>
                  <option>Innovation Lab</option>
                  <option>Cafeteria</option>
                  <option>Classroom</option>
                </select>
              </Field>
              <Field label="Learning mode">
                <select value={learningMode} onChange={(e) => setLearningMode(e.target.value)}>
                  <option value="">Select mode</option>
                  <option>1-to-1</option>
                  <option>Small Group</option>
                  <option>Both</option>
                </select>
              </Field>
            </div>
          </motion.section>

          <Button variant="primary" size="lg" type="submit" disabled={saving} className="pf-submit">
            {saving ? "Saving…" : "Find my AI match"}
          </Button>
        </form>
      </AppShell>
    </PageTransition>
  );
}

export default Profile;
