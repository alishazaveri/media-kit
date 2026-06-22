export type Theme = {
  identifier: string;
  name: string;
  accent_color: string;
  base_color: string;
  contrast_color: string;
  is_premium: boolean;
};

export const THEMES: Theme[] = [
  {
    identifier: "default",
    name: "Default",
    accent_color: "#ff7350",
    base_color: "#fff4ef",
    contrast_color: "#1B1210",
    is_premium: false,
  },

  {
    identifier: "violet",
    name: "Violet",
    accent_color: "#6F42C1",
    base_color: "#F3EFFF",
    contrast_color: "#160D26",
    is_premium: false,
  },
  {
    identifier: "blues",
    name: "Blues",
    accent_color: "#3363ea",
    base_color: "#edfcf5",
    contrast_color: "#0D1B2A",
    is_premium: false,
  },
  {
    identifier: "chocolate",
    name: "Chocolate",
    accent_color: "#8D5B4C",
    base_color: "#FDF8F5",
    contrast_color: "#1A1210",
    is_premium: false,
  },
  {
    identifier: "forest",
    name: "Forest",
    accent_color: "#2E7D32",
    base_color: "#F1F8F2",
    contrast_color: "#0B1A0E",
    is_premium: false,
  },
  {
    identifier: "thunder",
    name: "Thunder",
    accent_color: "#495057",
    base_color: "#F1F3F5",
    contrast_color: "#0A0A0A",
    is_premium: false,
  },
  {
    identifier: "bubblegum",
    name: "Bubblegum",
    accent_color: "#D63384",
    base_color: "#FFF0F5",
    contrast_color: "#2B0A18",
    is_premium: false,
  },
];

export function getThemeByIdentifier(identifier: string): Theme | undefined {
  return THEMES.find((t) => t.identifier === identifier);
}
