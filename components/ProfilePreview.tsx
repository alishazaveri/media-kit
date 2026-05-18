"use client";

import { useState, useEffect } from "react";
import {
  CreatorProfile,
  type CreatorProfileProps,
  type ThemeData,
} from "@/components/CreatorProfile";
import { getThemeByIdentifier } from "@/constants/themes";

export type { CreatorProfileProps as ProfilePreviewProps };

export function ProfilePreview(props: CreatorProfileProps) {
  const [theme, setTheme] = useState<ThemeData | undefined>(props.theme);

  useEffect(() => {
    if (props.theme) {
      setTheme(props.theme);
      return;
    }
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const identifier = data.draft?.theme_identifier;
        const t = identifier ? getThemeByIdentifier(identifier) : undefined;
        if (t) {
          setTheme({ accent_color: t.accent_color, base_color: t.base_color, contrast_color: t.contrast_color });
        }
      })
      .catch(() => {});
  }, [props.theme]);

  return <CreatorProfile {...props} theme={theme} />;
}
