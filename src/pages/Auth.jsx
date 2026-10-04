import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, register } from "../services/api";
import SyncMark from "../components/ui/SyncMark";
import Button from "../components/ui/Button";
import PageTransition from "../components/ui/PageTransition";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    department: "",
    year: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        await register(form);
        setForm({ name: "", email: "", password: "", college: "", department: "", year: "" });
        setIsLogin(true);
        setNotice("Account created — log in to continue.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-brand">
          <div className="auth-brand-top">
            <SyncMark size={30} />
            <span>SkillSync</span>
          </div>

          <div className="auth-brand-mid">
            <p className="auth-quote">
              “The best way to learn something for good is to teach it to
              someone else.”
            </p>
            <div className="auth-quote-rule" />
            <p className="auth-quote-sub">
              Every SkillSync match pairs a teacher with a learner — most
              students end up being both.
            </p>
          </div>

          <div className="auth-brand-cards">
            <div className="auth-mini-card">
              <span className="auth-mini-n">01</span>
              Tell us what you know and what you want next
            </div>
            <div className="auth-mini-card">
              <span className="auth-mini-n">02</span>
              We rank your best-fit partners on campus
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
            <p className="auth-sub">
              {isLogin
                ? "Sign in to see your matches and continue your sessions."
                : "Set up your account, then build a profile SkillSync can match on."}
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={isLogin ? "is-active" : ""}
                onClick={() => setIsLogin(true)}
              >
                Log in
              </button>
              <button
                type="button"
                className={!isLogin ? "is-active" : ""}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
              <motion.span
                className="auth-tab-pill"
                animate={{ x: isLogin ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {notice && <div className="auth-notice">{notice}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <>
                  <div className="auth-field">
                    <label>Full name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Rahul Sharma"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="auth-field-row">
                    <div className="auth-field">
                      <label>College</label>
                      <input
                        type="text"
                        name="college"
                        placeholder="SRM Institute"
                        value={form.college}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="auth-field">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        placeholder="CSE"
                        value={form.department}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="auth-field auth-field-sm">
                      <label>Year</label>
                      <input
                        type="text"
                        name="year"
                        placeholder="3rd"
                        value={form.year}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button variant="primary" size="lg" className="auth-submit" disabled={loading} type="submit">
                {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
              </Button>
            </form>

            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Register" : "Log in"}
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Auth;
