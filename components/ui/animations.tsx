"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// 淡入上移动画 - 适合内容块
type FadeInUpProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeInUp({ children, delay = 0, className = "" }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 缩放淡入动画 - 适合卡片
type ScaleInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function ScaleIn({ children, delay = 0, className = "" }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 滑入动画 - 适合侧边内容
type SlideInProps = {
  children: ReactNode;
  direction?: "left" | "right";
  delay?: number;
  className?: string;
};

export function SlideIn({ children, direction = "left", delay = 0, className = "" }: SlideInProps) {
  const xOffset = direction === "left" ? -30 : 30;
  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 卡片悬停效果
type HoverCardProps = {
  children: ReactNode;
  className?: string;
};

export function HoverCard({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 脉冲动画 - 适合加载或强调
type PulseProps = {
  children: ReactNode;
  className?: string;
};

export function Pulse({ children, className = "" }: PulseProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 交错子元素动画 - 适合列表

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 浮动动画 - 适合装饰元素
type FloatProps = {
  children: ReactNode;
  className?: string;
};

export function Float({ children, className = "" }: FloatProps) {
  return (
    <motion.div
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 旋转动画 - 适合加载图标
type SpinProps = {
  children: ReactNode;
  className?: string;
};

export function Spin({ children, className = "" }: SpinProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 闪光效果 - 适合按钮点击
type ShimmerProps = {
  children: ReactNode;
  className?: string;
};

export function Shimmer({ children, className = "" }: ShimmerProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover="hover"
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={{
          hover: {
            x: ["-100%", "100%"],
            transition: { duration: 0.6 },
          },
        }}
      />
    </motion.div>
  );
}
