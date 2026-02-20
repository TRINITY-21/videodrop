"use client";

import { useSpring, motion, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const display = useTransform(spring, (v) => `${Math.round(v)}%`);

  return <motion.span className={className}>{display}</motion.span>;
}
