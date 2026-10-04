import { motion } from "framer-motion";
import "./FeatureCard.css";

function FeatureCard({ icon, title, description, index }) {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

export default FeatureCard;
