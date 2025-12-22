"use client";
import { useEffect } from "react";

export default function ScrollBridge() {
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      window.parent.postMessage({ type: "scroll", deltaY: e.deltaY },"*");
    };

    window.addEventListener("wheel", handler, { passive: false });
    return () => {window.removeEventListener("wheel", handler);};

  }, []);

  return null;
}