"use client";

import {
  CreatorProfile,
  type CreatorProfileProps,
} from "@/components/CreatorProfile";

export type { CreatorProfileProps as ProfilePreviewProps };

export function ProfilePreview(props: CreatorProfileProps) {
  return <CreatorProfile {...props} />;
}
