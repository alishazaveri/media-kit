"use client";

import { useState } from "react";
import { IgStats } from "./types";
import { formatCount } from "./utils";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Button from "@/components/reusable/Button";

interface Props {
  email: string;
  appUsername: string;
  handle: string;
  igStats: IgStats;
  onLogout: () => void;
  onConnectInstagram: () => void;
  onDisconnectInstagram: () => void;
  onDeleteAccount: () => Promise<void>;
}

export function AccountTab({ email, appUsername, handle, igStats, onLogout, onConnectInstagram, onDisconnectInstagram, onDeleteAccount }: Props) {
  const isConnected = Boolean(handle);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-5">
      {showDisconnectModal && (
        <ConfirmModal
          title="Disconnect Instagram?"
          description="Your Instagram data will be removed from your Kloot page. You can reconnect at any time."
          confirmLabel="Yes, disconnect"
          cancelLabel="Cancel"
          onConfirm={() => {
            setShowDisconnectModal(false);
            onDisconnectInstagram();
          }}
          onCancel={() => setShowDisconnectModal(false)}
        />
      )}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete account and data?"
          description="This will permanently delete your account, Instagram connection, and all associated data. This cannot be undone."
          confirmLabel={deleting ? "Deleting…" : "Yes, delete my account"}
          cancelLabel="Cancel"
          onConfirm={async () => {
            setDeleting(true);
            await onDeleteAccount();
            setDeleting(false);
          }}
          onCancel={() => !deleting && setShowDeleteModal(false)}
        />
      )}
      <div className="max-w-2xl mx-auto space-y-5">
        <h2 className="text-2xl font-black text-gray-900">Account</h2>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <p className="font-bold text-gray-900 text-base">Account info</p>
          <div>
            <label className="text-sm text-gray-500 block mb-1.5">Email</label>
            <input
              value={email}
              readOnly
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50 text-gray-500 cursor-default"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1.5">Username</label>
            <div className="flex border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              <span className="flex items-center justify-center w-12 bg-gray-100 text-gray-400 text-sm border-r border-gray-200 shrink-0">
                @
              </span>
              <input
                value={appUsername}
                readOnly
                className="flex-1 px-4 py-3 text-sm outline-none bg-gray-50 text-gray-500 cursor-default"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              readOnly
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50 cursor-default"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-bold text-gray-900 text-base mb-4">Connected accounts</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" r="1" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Instagram</p>
                <p className="text-xs text-gray-400">
                  {isConnected
                    ? `@${handle}${igStats.followers != null ? ` · ${formatCount(igStats.followers)} followers` : ""}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {isConnected ? (
              <button
                onClick={() => setShowDisconnectModal(true)}
                className="border border-red-200 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={onConnectInstagram}
                className="border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Uncomment later */}
        {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-bold text-gray-900 text-base mb-4">Subscription</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Creator Pro · Annual</p>
              <p className="text-xs text-gray-400">$79/year · Renews May 6, 2027</p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
              Active
            </span>
          </div>
          <button className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Cancel subscription
          </button>
        </div> */}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setAdvancedOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Advanced settings
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
            >
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {advancedOpen && (
            <div className="border-t border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Delete account and data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently removes your account and all associated data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0 ml-4 border border-red-200 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <Button variant="danger" size="lg" onClick={onLogout} fullWidth className="rounded-2xl">
          Log out
        </Button>
      </div>
    </div>
  );
}
