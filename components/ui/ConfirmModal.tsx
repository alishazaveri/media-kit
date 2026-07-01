"use client";

import Button from "@/components/reusable/Button";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button variant="danger" size="md" onClick={onConfirm} fullWidth className="rounded-2xl">
            {confirmLabel}
          </Button>
          <Button variant="default" size="md" onClick={onCancel} fullWidth className="rounded-2xl">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
