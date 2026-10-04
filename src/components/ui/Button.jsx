import { motion } from "framer-motion";
import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  className = "",
  ...rest
}) {
  const Component = motion[as] || motion.button;

  return (
    <Component
      className={`ss-btn ss-btn-${variant} ss-btn-${size} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Button;
