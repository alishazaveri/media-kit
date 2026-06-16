"use client";

import { useState } from "react";
import { Package } from "../types";
import Button from "@/components/reusable/Button";
import { Toggle, Input } from "./shared";

interface ServicesSectionProps {
  servicesVisible: boolean;
  setServicesVisible: (v: boolean) => void;
  packages: Package[];
  addPackage: () => void;
  removePackage: (id: number) => void;
  updatePackage: (id: number, field: keyof Package, value: string | boolean) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function ServicesSection({
  servicesVisible,
  setServicesVisible,
  packages,
  addPackage,
  removePackage,
  updatePackage,
  onSectionFocus,
}: ServicesSectionProps) {
  const [pendingDeletePackage, setPendingDeletePackage] = useState<number | null>(null);

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5"
      onFocus={() => onSectionFocus?.("partner")}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-900">Services &amp; rates</p>
        <Toggle checked={servicesVisible} onChange={setServicesVisible} />
      </div>

      <div className="space-y-3">
        {packages.map((pkg) => {
          const isPending = pendingDeletePackage === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`rounded-xl p-3 space-y-2 border transition-colors ${isPending ? "border-red-200 bg-red-50" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex md:flex-row flex-col md:items-center gap-2 w-full">
                  <Input
                    value={pkg.title}
                    onChange={(v) => updatePackage(pkg.id, "title", v)}
                    placeholder="Service name"
                    className="flex-1"
                  />
                  <Input
                    value={pkg.price}
                    onChange={(v) => updatePackage(pkg.id, "price", v)}
                    placeholder="₹0"
                    className="!w-28 md:block hidden"
                  />
                </div>
                {isPending ? (
                  <div className="flex md:items-center gap-1.5 shrink-0">
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => {
                        removePackage(pkg.id);
                        setPendingDeletePackage(null);
                      }}
                      className="rounded-lg"
                    >
                      Remove
                    </Button>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setPendingDeletePackage(null);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1 1l8 8M9 1L1 9"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingDeletePackage(pkg.id)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors outline-none focus:outline-none cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
              </div>
              <Input
                value={pkg.price}
                onChange={(v) => updatePackage(pkg.id, "price", v)}
                placeholder="₹0"
                className="md:hidden"
              />
              <textarea
                value={pkg.description}
                onChange={(e) => updatePackage(pkg.id, "description", e.target.value)}
                placeholder="Short description"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none bg-white"
              />
            </div>
          );
        })}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={addPackage}
        fullWidth
        className="rounded-xl mt-3"
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        }
      >
        Add service
      </Button>
    </section>
  );
}
