import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  icon: React.ReactNode;
}

const StatCounter = ({ end, suffix = "", prefix = "", duration = 2000, label, icon }: StatCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 group",
        isVisible ? "animate-count-up" : "opacity-0"
      )}
    >
      <div className="w-14 h-14 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
        {icon}
      </div>
      <span className="text-4xl font-serif font-bold text-foreground mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </span>
      <span className="text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

export default StatCounter;
