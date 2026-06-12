"use client";

import { useEffect, useState } from "react";
import {
  CreatorProfile,
  type CreatorProfileProps,
} from "@/components/CreatorProfile";

export default function PreviewPage() {
  const [props, setProps] = useState<CreatorProfileProps | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_UPDATE") {
        setProps(e.data.payload);
      } else if (e.data?.type === "SCROLL_TO_SECTION") {
        const el = document.getElementById(e.data.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!props) {
    return <div className="h-screen bg-white" />;
  }

  return <CreatorProfile {...props} />;
}
