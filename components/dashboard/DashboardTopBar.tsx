"use client";

interface Props {
  appUsername: string;
  profilePic: string | null;
  publishing?: boolean;
  hasUnpublishedChanges?: boolean;
  onPublish?: () => void;
  onToggleCollapse: () => void;
}

export function DashboardTopBar({
  appUsername,
  profilePic,
  publishing = false,
  hasUnpublishedChanges = false,
  onPublish,
  onToggleCollapse,
}: Props) {
  return (
    <div className="bg-[#fdfdfd] border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
      {/* Mobile: logo */}
      <div className="lg:hidden flex items-center">
        <img
          src="/assets/images/logo/logo-transparent-slim.png"
          alt="Kloot"
          className="h-6 w-auto object-contain"
        />
      </div>

      {/* Desktop: sidebar toggle */}
      <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </button>

      {/* Center: URL bar */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full max-w-xs">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <a
            href={`/${appUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 flex-1 hover:text-primary transition-colors truncate"
          >
            kloot.io/{appUsername}
          </a>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shrink-0">
            LIVE
          </span>
          <button
            onClick={() =>
              navigator.clipboard.writeText(`https://kloot.io/${appUsername}`)
            }
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Copy link"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <a
            href={`/${appUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Open live"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Right: device toggles + actions + avatar */}
      <div className="flex items-center gap-2 ml-auto lg:ml-0">
        {onPublish && <div className="hidden lg:flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          {(
            [
              {
                title: "Mobile",
                d: "M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z",
              },
              {
                title: "Tablet",
                d: "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z",
              },
              {
                title: "Desktop",
                d: "M2 3h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V5a2 2 0 012-2zM8 21h8M12 17v4",
              },
            ] as { title: string; d: string }[]
          ).map(({ title, d }) => (
            <button
              key={title}
              title={title}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={d} />
              </svg>
            </button>
          ))}
        </div>}

        <a
          href={`/${appUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open live
        </a>

        {onPublish && (
          <button
            onClick={onPublish}
            disabled={publishing || !hasUnpublishedChanges}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {publishing ? "Saving…" : "Save & publish"}
          </button>
        )}

        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
          {profilePic && (
            <img
              src={profilePic}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
