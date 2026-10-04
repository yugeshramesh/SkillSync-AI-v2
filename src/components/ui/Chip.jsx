import "./Chip.css";

function Chip({ children, tone = "navy" }) {
  return <span className={`ss-chip ss-chip-${tone}`}>{children}</span>;
}

export default Chip;
