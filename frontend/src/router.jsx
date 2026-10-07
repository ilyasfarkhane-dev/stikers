import { useEffect, useState } from "react";

export function normalizePath(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

function readLocation() {
  return { path: normalizePath(window.location.pathname), search: window.location.search };
}

export function useLocation() {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onChange = () => setLocation(readLocation());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  return location;
}

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  const nextPath = normalizePath(url.pathname);
  const currentPath = normalizePath(window.location.pathname);
  const next = `${url.pathname}${url.search}${url.hash}`;

  if (nextPath === currentPath && url.search === window.location.search) {
    window.history.pushState({}, "", next);
    if (url.hash) {
      document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
    return;
  }

  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function AppLink({ href, className = "", children, onClick, ...rest }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
