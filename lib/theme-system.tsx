export interface InvoiceTheme {
  id: string
  name: string
  colors: {
    headerBg: string
    headerText: string
    accentColor: string
    borderColor: string
    textColor: string
    backgroundColor: string
  }
  fonts: {
    heading: string
    body: string
  }
  styles: {
    borderRadius: string
    rowAlternation: boolean
    alternationColor: string
  }
}

export const DEFAULT_THEMES: InvoiceTheme[] = [
  {
    id: "professional",
    name: "Professional",
    colors: {
      headerBg: "#1e3a5f",
      headerText: "#ffffff",
      accentColor: "#ff6b35",
      borderColor: "#e5e7eb",
      textColor: "#2d3436",
      backgroundColor: "#f8f9fa",
    },
    fonts: {
      heading: "Arial, sans-serif",
      body: "Calibri, sans-serif",
    },
    styles: {
      borderRadius: "4px",
      rowAlternation: true,
      alternationColor: "#f3f4f6",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    colors: {
      headerBg: "#ffffff",
      headerText: "#1f2937",
      accentColor: "#3b82f6",
      borderColor: "#d1d5db",
      textColor: "#374151",
      backgroundColor: "#ffffff",
    },
    fonts: {
      heading: "Helvetica, sans-serif",
      body: "Georgia, serif",
    },
    styles: {
      borderRadius: "2px",
      rowAlternation: false,
      alternationColor: "#ffffff",
    },
  },
  {
    id: "modern",
    name: "Modern",
    colors: {
      headerBg: "#0f172a",
      headerText: "#f1f5f9",
      accentColor: "#06b6d4",
      borderColor: "#cbd5e1",
      textColor: "#1e293b",
      backgroundColor: "#f8fafc",
    },
    fonts: {
      heading: "Trebuchet MS, sans-serif",
      body: "Verdana, sans-serif",
    },
    styles: {
      borderRadius: "6px",
      rowAlternation: true,
      alternationColor: "#f1f5f9",
    },
  },
]

export function applyThemeToHtml(html: string, theme: InvoiceTheme): string {
  const style = `
    <style>
      :root {
        --header-bg: ${theme.colors.headerBg};
        --header-text: ${theme.colors.headerText};
        --accent-color: ${theme.colors.accentColor};
        --border-color: ${theme.colors.borderColor};
        --text-color: ${theme.colors.textColor};
        --bg-color: ${theme.colors.backgroundColor};
        --font-heading: ${theme.fonts.heading};
        --font-body: ${theme.fonts.body};
        --border-radius: ${theme.styles.borderRadius};
      }
      body {
        font-family: var(--font-body);
        color: var(--text-color);
        background-color: var(--bg-color);
      }
      .header { 
        background-color: var(--header-bg); 
        color: var(--header-text);
        border-radius: var(--border-radius);
      }
      h1, h2, h3 { font-family: var(--font-heading); }
      table {
        border-color: var(--border-color);
      }
      th {
        background-color: var(--header-bg);
        color: var(--header-text);
      }
      ${theme.styles.rowAlternation ? `tr:nth-child(even) { background-color: ${theme.styles.alternationColor}; }` : ""}
      .accent { color: var(--accent-color); }
    </style>
  `
  return style + html
}

export function getThemeById(themeId: string): InvoiceTheme {
  return DEFAULT_THEMES.find((t) => t.id === themeId) || DEFAULT_THEMES[0]
}
