import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// Two concentric arcs sweeping into place - echoes the SyncMark's
// overlapping-circle idea, used wherever we show a match/compatibility score.
function RadialGauge({
  value = 0,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  tone = "yellow",
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const controls = useAnimation();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    controls.start({
      strokeDashoffset: circumference - (value / 100) * circumference,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    });

    const start = performance.now();
    const duration = 1100;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const accentColor = tone === "yellow" ? "var(--yellow)" : "var(--teal)";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: size * 0.24,
            fontWeight: 600,
            color: "var(--navy)",
            lineHeight: 1,
          }}
        >
          {label !== undefined ? label : `${display}%`}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: size * 0.09,
              color: "var(--muted)",
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default RadialGauge;
