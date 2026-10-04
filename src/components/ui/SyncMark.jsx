function SyncMark({ size = 28, ink = "var(--navy)", accent = "var(--yellow)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="20" r="12.5" fill={ink} />
      <circle cx="24" cy="20" r="12.5" fill={accent} />
      <path
        d="M20 8.2A12.46 12.46 0 0 1 20 31.8 12.46 12.46 0 0 1 20 8.2Z"
        fill={ink}
        fillOpacity="0.9"
      />
    </svg>
  );
}

export default SyncMark;
