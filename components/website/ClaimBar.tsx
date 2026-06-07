"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ClaimBar() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleClaim = () => {
    const url = username
      ? `/onboarding?username=${encodeURIComponent(username)}`
      : "/app/onboarding";
    router.push(url);
    // setUsername("");
  };

  return (
    <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 z-50 w-[min(92vw,500px)]">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 flex items-center gap-3 px-4 py-3">
        <Image
          src="/assets/images/logo/logo-k-transparent.png"
          alt="Kloot"
          height={36}
          width={36}
          className="object-contain shrink-0"
        />
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-gray-400 text-sm font-medium shrink-0">
            kloot.io/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClaim()}
            placeholder="username"
            className="flex-1 min-w-0 text-sm font-semibold text-primary placeholder-primaryBF outline-none bg-transparent "
          />
        </div>
        <button
          onClick={handleClaim}
          className="shrink-0 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          Claim Now
        </button>
      </div>
    </div>
  );
}
