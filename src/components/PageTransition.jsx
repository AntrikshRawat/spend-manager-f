import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../pageTransitions.css";

/**
 * PageTransition — wraps page content and plays a CSS enter animation
 * every time the route (location.pathname) changes.
 *
 * Usage:
 *   <PageTransition>
 *     <div>...your page content...</div>
 *   </PageTransition>
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("enter");
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // When the pathname changes, start exit animation first
    if (location.pathname !== prevPathname.current) {
      setTransitionStage("exit");
    }
  }, [location.pathname]);

  const handleAnimationEnd = () => {
    if (transitionStage === "exit") {
      // After exit finishes, swap in new children and start enter
      setDisplayChildren(children);
      setTransitionStage("enter");
      prevPathname.current = location.pathname;
    }
  };

  // Also keep children in sync when they change without a route change
  useEffect(() => {
    if (transitionStage === "enter") {
      setDisplayChildren(children);
    }
  }, [children, transitionStage]);

  const className =
    transitionStage === "exit"
      ? "page-transition page-transition--exit"
      : "page-transition";

  return (
    <div
      ref={containerRef}
      className={className}
      onAnimationEnd={handleAnimationEnd}
      key={transitionStage === "enter" ? location.pathname : prevPathname.current}
    >
      {displayChildren}
    </div>
  );
}
