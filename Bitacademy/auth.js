window.BitAcademyIcons = (() => {
  const PATHS = {
    "palette": '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    "flask-conical": '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    "microscope": '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    "atom": '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
    "brain": '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
    "globe-2": '<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/>',
    "landmark": '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    "scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    "languages": '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    "calculator": '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    "sigma": '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    "book-open-text": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/>',
    "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    "book-marked": '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/>',
    "feather": '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "zap": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    "sparkles": '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "bar-chart-3": '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    "file-spreadsheet": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    "gamepad-2": '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
    "trophy": '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    "medal": '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
    "award": '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    "star": '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    "timer": '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "calendar": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "check-circle-2": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "alert-circle": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    "pencil": '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    "trash-2": '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    "history": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    "megaphone": '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    "printer": '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    "send": '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "unlock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "user-check": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
    "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    "eye": '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    "log-in": '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    "key-round": '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    "circle": '<circle cx="12" cy="12" r="9"/>',
    "help-circle": '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    "play": '<polygon points="6 3 20 12 6 21 6 3"/>',
    "layers": '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    "trending-up": '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'
  };

  const SUBJECT_ICON_MAP = {
    artes: "palette",
    ciencias: "flask-conical",
    filosofia: "brain",
    geografia: "globe-2",
    historia: "landmark",
    ingles: "languages",
    matematica: "calculator",
    portugues: "book-open-text"
  };

  const EMOJI_TO_ICON = {
    "🎨": "palette",
    "🔬": "flask-conical",
    "⚛️": "atom",
    "💭": "brain",
    "🧠": "brain",
    "🌎": "globe-2",
    "📜": "scroll-text",
    "🗣": "languages",
    "🗣️": "languages",
    "➗": "calculator",
    "📐": "compass",
    "📚": "book-open-text",
    "🖋️": "feather",
    "📘": "book-open"
  };

  const svg = (name, size = 18, extraClass = "") => {
    const cleanName = String(name || "").trim().toLowerCase();
    const inner = PATHS[cleanName] || PATHS["book-open"];
    const cls = `lucide lucide-${cleanName}${extraClass ? ` ${extraClass}` : ""}`;
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  };

  const subjectIconName = (slug, rawIcon) => {
    const cleanSlug = String(slug || "").trim().toLowerCase();
    if (SUBJECT_ICON_MAP[cleanSlug]) return SUBJECT_ICON_MAP[cleanSlug];
    const cleanRaw = String(rawIcon || "").trim();
    if (PATHS[cleanRaw.toLowerCase()]) return cleanRaw.toLowerCase();
    if (EMOJI_TO_ICON[cleanRaw]) return EMOJI_TO_ICON[cleanRaw];
    return "book-open";
  };

  const forSubject = (slug, rawIcon, size = 22) => svg(subjectIconName(slug, rawIcon), size);

  const hydrate = (root = document) => {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("[data-lucide]").forEach((el) => {
      if (el.dataset.lucideHydrated === "true") return;
      const name = el.getAttribute("data-lucide");
      const size = Number(el.getAttribute("data-lucide-size") || 18);
      el.innerHTML = svg(name, size);
      el.dataset.lucideHydrated = "true";
      el.classList.add("lucide-holder");
    });
  };

  if (typeof document !== "undefined") {
    const startObserver = () => {
      hydrate(document);
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            hydrate(document);
            break;
          }
        }
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startObserver);
    } else {
      startObserver();
    }
  }

  const avatarUrl = (seed) => {
    const cleanSeed = encodeURIComponent(String(seed || "BitAcademy").trim());
    return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${cleanSeed}&radius=50&backgroundColor=1e1b4b,0f172a,172554,312e81`;
  };

  const avatar = (seed, size = 36, extraClass = "") => {
    const url = avatarUrl(seed);
    const safeName = String(seed || "Usuário")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const cls = `ba-avatar${extraClass ? ` ${extraClass}` : ""}`;
    return `<img class="${cls}" src="${url}" width="${size}" height="${size}" alt="Avatar de ${safeName}" loading="lazy" decoding="async">`;
  };

  return { svg, forSubject, subjectIconName, hydrate, avatarUrl, avatar };
})();

window.BitAcademyMotion = (() => {
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPRING_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const BOUNCE_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const resolveElements = (target, root = document) => {
    if (!target) return [];
    if (typeof target === "string") return Array.from(root.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target.length !== undefined) return Array.from(target);
    return [];
  };

  const stagger = (stepSeconds = 0.06, startDelay = 0) => (index) => startDelay + index * stepSeconds;

  const buildKeyframes = (spec) => {
    if (Array.isArray(spec)) return spec;
    const steps = 2;
    const frames = [];
    for (let i = 0; i < steps; i++) {
      const frame = {};
      const transforms = [];
      for (const [key, val] of Object.entries(spec)) {
        const v = Array.isArray(val) ? val[i] ?? val[val.length - 1] : val;
        if (key === "y") transforms.push(`translateY(${typeof v === "number" ? `${v}px` : v})`);
        else if (key === "x") transforms.push(`translateX(${typeof v === "number" ? `${v}px` : v})`);
        else if (key === "scale") transforms.push(`scale(${v})`);
        else if (key === "rotate") transforms.push(`rotate(${typeof v === "number" ? `${v}deg` : v})`);
        else frame[key] = v;
      }
      if (transforms.length) frame.transform = transforms.join(" ");
      frames.push(frame);
    }
    return frames;
  };

  const animate = (target, keyframesSpec, options = {}) => {
    const elements = resolveElements(target, options.root || document);
    if (!elements.length || prefersReducedMotion()) return [];
    const frames = buildKeyframes(keyframesSpec);
    const durationMs = (options.duration ?? 0.45) * 1000;
    const easing = options.type === "spring" ? BOUNCE_EASE : options.easing || SPRING_EASE;

    return elements.map((el, idx) => {
      if (!el || typeof el.animate !== "function") return null;
      const delaySec = typeof options.delay === "function" ? options.delay(idx, elements.length) : (options.delay || 0);
      return el.animate(frames, {
        duration: durationMs,
        delay: delaySec * 1000,
        easing,
        fill: options.fill || "both"
      });
    });
  };

  const inView = (target, callback, options = {}) => {
    const elements = resolveElements(target, options.root || document);
    if (!elements.length) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => callback(el));
      return;
    }
    const once = options.once !== false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.amount ?? 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
  };

  const staggerCards = (container, itemSelector, options = {}) => {
    const rootEl = typeof container === "string" ? document.querySelector(container) : container;
    if (!rootEl) return;
    const items = itemSelector ? Array.from(rootEl.querySelectorAll(itemSelector)) : [rootEl];
    if (!items.length || prefersReducedMotion()) return;
    const yDist = options.y ?? 20;
    const step = options.stagger ?? 0.055;
    animate(
      items,
      { opacity: [0, 1], y: [yDist, 0], scale: [0.97, 1] },
      {
        duration: options.duration ?? 0.46,
        delay: stagger(step, options.startDelay ?? 0),
        easing: SPRING_EASE
      }
    );
  };

  const panelIn = (panel) => {
    const el = typeof panel === "string" ? document.querySelector(panel) : panel;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: 0.36, easing: SPRING_EASE });
  };

  const drawerIn = (drawer) => {
    const el = typeof drawer === "string" ? document.querySelector(drawer) : drawer;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1], y: [-10, 0], scale: [0.985, 1] }, { duration: 0.32, easing: SPRING_EASE });
  };

  const pop = (target, peakScale = 1.14) => {
    const elements = resolveElements(target);
    if (!elements.length || prefersReducedMotion()) return;
    elements.forEach((el) => {
      if (typeof el.animate !== "function") return;
      el.animate(
        [
          { transform: "scale(1)" },
          { transform: `scale(${peakScale})` },
          { transform: "scale(1)" }
        ],
        { duration: 360, easing: BOUNCE_EASE }
      );
    });
  };

  const shake = (target) => {
    const elements = resolveElements(target);
    if (!elements.length || prefersReducedMotion()) return;
    elements.forEach((el) => {
      if (typeof el.animate !== "function") return;
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 380, easing: "ease-in-out" }
      );
    });
  };

  const countUp = (el, endValue, options = {}) => {
    const targetEl = typeof el === "string" ? document.querySelector(el) : el;
    const numeric = Number(endValue);
    if (!targetEl || !Number.isFinite(numeric)) return;
    const suffix = options.suffix || "";
    const decimals = options.decimals ?? 0;
    if (prefersReducedMotion() || numeric === 0) {
      targetEl.textContent = `${numeric.toFixed(decimals)}${suffix}`;
      return;
    }
    const duration = options.duration ?? 720;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = numeric * eased;
      targetEl.textContent = `${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const animateMeters = (root = document) => {
    if (!root || prefersReducedMotion()) return;
    root.querySelectorAll(".grade-meter-fill, .weight-meter-fill").forEach((bar) => {
      const targetWidth = bar.style.width || "0%";
      if (typeof bar.animate === "function") {
        bar.animate([{ width: "0%" }, { width: targetWidth }], {
          duration: 680,
          easing: SPRING_EASE,
          fill: "forwards"
        });
      }
    });
    root.querySelectorAll(".board-chart span").forEach((bar, idx) => {
      const targetHeight = bar.style.height || "50%";
      if (typeof bar.animate === "function") {
        bar.animate([{ height: "12%", opacity: 0.4 }, { height: targetHeight, opacity: 1 }], {
          duration: 640,
          delay: idx * 70,
          easing: BOUNCE_EASE,
          fill: "forwards"
        });
      }
    });
  };

  const initPageAnimations = () => {
    if (prefersReducedMotion()) return;
    // Hero & Study Board
    panelIn(".learning-hero .hero-copy");
    animate(".learning-hero .study-board", { opacity: [0, 1], y: [22, 0], scale: [0.96, 1] }, { duration: 0.55, delay: 0.1 });
    animateMeters(document);

    // Overview cards na Home
    inView(".home-overview", (el) => {
      staggerCards(el, "article", { stagger: 0.08, y: 18 });
    });

    // Seção de trilhas e prática na Home
    inView("#trilhas", (el) => panelIn(el));
    inView(".math-game-banner", (el) => panelIn(el));
    inView(".quiz-Quick-grid", (el) => staggerCards(el, ".quiz-pill-card", { stagger: 0.045, y: 16 }));

    // Página Sobre Nós
    inView(".about-hero", (el) => {
      panelIn(el);
      staggerCards(el, ".about-pillars article", { stagger: 0.08, startDelay: 0.1 });
    });
    inView(".about-story-grid", (el) => staggerCards(el, ".about-story-card", { stagger: 0.1 }));
    inView(".team-grid", (el) => staggerCards(el, ".team-card", { stagger: 0.065 }));

    // Página de Login
    panelIn(".login-card");
    animate(".access-panel", { opacity: [0, 1], x: [18, 0] }, { duration: 0.48, delay: 0.08 });
  };

  return {
    animate,
    stagger,
    inView,
    staggerCards,
    panelIn,
    drawerIn,
    pop,
    shake,
    countUp,
    animateMeters,
    initPageAnimations
  };
})();

window.BitAcademyAuth = (() => {
  let currentUser = null;
  let profileData = null;

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const getRelativePrefix = () => {
    const path = window.location.pathname;
    return path.includes("/Quiz/") || path.includes("/Jogos/") ? "../" : "";
  };
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const api = async (path, options = {}) => {
    const response = await fetch(`${getRelativePrefix()}api/${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });

    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Ocorreu um erro na comunicação com o servidor.");
    return data;
  };

  const loadCurrentUser = async () => {
    try {
      const data = await api("auth/me");
      currentUser = data.user || null;
    } catch {
      currentUser = null;
    }
    return currentUser;
  };

  const ready = loadCurrentUser();

  const getCurrentUser = () => currentUser;

  const register = async ({ name, email, password }) => {
    const data = await api("auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(name || "").trim(),
        email: normalize(email),
        password
      })
    });
    currentUser = data.user;
    return currentUser;
  };

  const login = async ({ email, password }) => {
    const data = await api("auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalize(email), password })
    });
    currentUser = data.user;
    return currentUser;
  };

  const logout = async () => {
    try { await api("auth/logout", { method: "POST" }); } catch {}
    currentUser = null;
    window.location.href = `${getRelativePrefix()}login.html`;
  };

  const recordQuizResult = async ({ materia, answers }) => {
    const data = await api("quizzes?action=result", {
      method: "POST",
      body: JSON.stringify({ materia, answers })
    });
    return data.result;
  };

  const getQuizRanking = async (materia, limit = 10) => {
    const params = new URLSearchParams({ materia, limit: String(limit) });
    const data = await api(`quizzes?action=ranking&${params}`);
    return data.ranking || [];
  };

  const getProgress = async () => {
    if (!currentUser) return [];
    if (!profileData) {
      profileData = await api("profile");
    }
    return profileData.quizResults || [];
  };

  const startGame = async () => {
    return api("games?action=start", {
      method: "POST",
      body: JSON.stringify({ mode: "math-infinite" })
    });
  };

  const submitGameAnswer = async ({ sessionId, answer, revision }) => {
    return api("games?action=answer", {
      method: "POST",
      body: JSON.stringify({ sessionId, answer, revision })
    });
  };

  const finishGame = async (sessionId) => {
    return api("games?action=finish", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const abortGame = async (sessionId) => {
    return api("games?action=abort", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const getGameRanking = async (mode, limit = 10) => {
    const params = new URLSearchParams({ mode, limit: String(limit) });
    const data = await api(`games?action=ranking&${params}`);
    return data.ranking || [];
  };

  const recordGameScore = async ({ mode, score, correct = 0, wrong = 0, bestStreak = 0, duration = 1 }) => {
    const data = await api("games?action=record", {
      method: "POST",
      body: JSON.stringify({ mode, score, correct, wrong, bestStreak, duration })
    });
    profileData = null;
    return data;
  };

  const getUserGameScores = async () => {
    if (!currentUser) return [];
    if (!profileData) profileData = await api("profile");
    return profileData.gameScores || [];
  };

  const renderAuthStatus = () => {
    document.querySelectorAll("[data-auth-status]").forEach((container) => {
      const user = getCurrentUser();
      const prefix = getRelativePrefix();
      if (!user) {
        container.innerHTML = `<a href="${prefix}login.html"><i data-lucide="log-in" data-lucide-size="16"></i> Entrar</a>`;
        return;
      }
      const firstName = escapeHtml(user.name.split(" ")[0]);
      const areaByRole = {
        Professor: { href: "professor.html", label: "Área do Professor", icon: "graduation-cap" },
        Administrador: { href: "admin.html", label: "Painel Admin", icon: "shield-check" }
      };
      const roleArea = areaByRole[user.type];
      const currentPage = window.location.pathname.split("/").pop().toLowerCase();
      const areaLink = roleArea && currentPage !== roleArea.href
        ? `<a class="auth-role-link" href="${prefix}${roleArea.href}"><i data-lucide="${roleArea.icon}" data-lucide-size="15"></i> ${roleArea.label}</a>`
        : "";
      container.innerHTML = `
        <a class="auth-user-pill" href="${prefix}perfil.html">
          ${window.BitAcademyIcons.avatar(user.name || user.email, 24, "auth-avatar-mini")}
          <span>Olá, ${firstName}</span>
          <span class="auth-role-badge">${escapeHtml(user.type)}</span>
        </a>
        ${areaLink}
        <button type="button" data-auth-logout><i data-lucide="log-out" data-lucide-size="15"></i> Sair</button>
      `;
    });
  };

  const renderProfile = async (activeTab = "resumo") => {
    const container = document.querySelector("[data-profile]");
    if (!container) return;

    await ready;
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.type === "Administrador") {
      container.innerHTML = `
        <section class="profile-hero">
          <div class="profile-user-identity">
            ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
            <div>
              <p class="eyebrow">Perfil Administrador</p>
              <h2>${escapeHtml(user.name)}</h2>
              <p>${escapeHtml(user.email)}</p>
            </div>
          </div>
          <a class="primary-link" href="admin.html"><i data-lucide="shield-check" data-lucide-size="17"></i> Abrir painel administrativo</a>
        </section>
        <section class="profile-card-section">
          <p class="eyebrow">Gestão da plataforma</p>
          <h2>Administração BitAcademy</h2>
          <p>Gerencie contas de usuários, professores, catálogo de disciplinas, anos letivos, turmas, matrículas e recursos interativos.</p>
          <div class="intro-actions" style="margin-top: 16px;">
            <a class="primary-link" href="admin.html">Ir para Administração</a>
            <a class="secondary-link" href="Bitacademy.html#disciplinas">Ver catálogo público</a>
          </div>
        </section>
      `;
      return;
    }

    if (user.type === "Professor") {
      const subjects = Array.isArray(user.subjects) ? user.subjects : [];
      container.innerHTML = `
        <section class="profile-hero">
          <div class="profile-user-identity">
            ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
            <div>
              <p class="eyebrow">Perfil Professor</p>
              <h2>${escapeHtml(user.name)}</h2>
              <p>${escapeHtml(user.email)}</p>
            </div>
          </div>
          <a class="primary-link" href="professor.html"><i data-lucide="graduation-cap" data-lucide-size="17"></i> Abrir Área do Professor</a>
        </section>
        <section class="profile-card-section">
          <p class="eyebrow">Gestão acadêmica</p>
          <h2>${subjects.length} ${subjects.length === 1 ? "disciplina vinculada" : "disciplinas vinculadas"}</h2>
          <p>${subjects.length ? subjects.map((subject) => escapeHtml(subject.name)).join(" · ") : "Aguarde o administrador vincular disciplinas à sua conta."}</p>
          <div class="intro-actions" style="margin-top: 16px;">
            <a class="primary-link" href="professor.html">Gerenciar materiais, atividades e boletim</a>
          </div>
        </section>
      `;
      return;
    }

    try {
      profileData = await api("profile");
    } catch (error) {
      container.innerHTML = `<section class="profile-card-section"><p>${escapeHtml(error.message)}</p></section>`;
      return;
    }

    const results = profileData.quizResults || [];
    const gameScores = profileData.gameScores || [];
    let availableActivities = [];
    let activitiesError = "";
    try {
      const activityData = await api("academic?action=student-activities");
      availableActivities = activityData.activities || [];
    } catch (error) { activitiesError = error.message; }
    let gradeReports = [];
    let gradeReportError = "";
    try {
      const gradeData = await api("gradebook?action=report");
      gradeReports = gradeData.reports || [];
    } catch (error) { gradeReportError = error.message; }
    const bestPercent = results.length ? Math.max(...results.map((result) => result.percent)) : 0;
    const bestGameScore = gameScores.length ? Math.max(...gameScores.map((result) => result.score)) : 0;
    const average = results.length
      ? Math.round(results.reduce((sum, result) => sum + result.percent, 0) / results.length)
      : 0;

    const statusBadgeForReport = (report) => {
      if (report.finalScore === null) {
        return `<span class="grade-status-badge in_progress">Em curso</span>`;
      }
      if (report.result === "passed") {
        return `<span class="grade-status-badge passed">Aprovado</span>`;
      }
      if (report.result === "recovery_pending") {
        return `<span class="grade-status-badge recovery_pending">Recuperação final pendente</span>`;
      }
      return `<span class="grade-status-badge not_passed">Não aprovado</span>`;
    };

    container.innerHTML = `
      <section class="profile-hero">
        <div class="profile-user-identity">
          ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
          <div>
            <p class="eyebrow">Perfil ${escapeHtml(user.type)}</p>
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.email)}</p>
          </div>
        </div>
        <div class="intro-actions">
          <a class="primary-link" href="Bitacademy.html#disciplinas"><i data-lucide="book-open" data-lucide-size="17"></i> Continuar estudando</a>
          <a class="secondary-link" href="Jogos/matematica-infinita.html"><i data-lucide="gamepad-2" data-lucide-size="17"></i> Jogar Matemática Infinita</a>
        </div>
      </section>

      <nav class="profile-tabs" role="tablist" aria-label="Seções do perfil do estudante">
        <button type="button" class="active" data-profile-tab="resumo"><i data-lucide="award" data-lucide-size="17"></i> Visão Geral &amp; Recordes</button>
        <button type="button" data-profile-tab="boletim"><i data-lucide="file-spreadsheet" data-lucide-size="17"></i> Boletim Escolar (${gradeReports.length})</button>
        <button type="button" data-profile-tab="atividades"><i data-lucide="clipboard-list" data-lucide-size="17"></i> Atividades (${availableActivities.length})</button>
      </nav>

      <section class="profile-tab-panel" data-profile-panel="resumo">
        <div class="profile-dashboard">
          <div class="profile-summary">
            <article><span><i data-lucide="book-marked" data-lucide-size="16"></i> Disciplinas com recorde</span><strong>${results.length}</strong></article>
            <article><span><i data-lucide="target" data-lucide-size="16"></i> Média nos quizzes</span><strong>${average}%</strong></article>
            <article><span><i data-lucide="trophy" data-lucide-size="16"></i> Melhor desempenho</span><strong>${bestPercent}%</strong></article>
            <article><span><i data-lucide="zap" data-lucide-size="16"></i> Recorde Matemática Infinita</span><strong>${bestGameScore}</strong></article>
          </div>
          <div class="profile-next-step">
            <div>
              <p class="eyebrow">Próximo passo</p>
              <h2>${results.length ? "Supere seus recordes" : "Faça seu primeiro quiz"}</h2>
              <p>${results.length ? "Seus melhores resultados por disciplina ficam registrados aqui e contam para o ranking oficial." : "Ao finalizar qualquer quiz conectado à sua conta, sua maior pontuação aparece automaticamente aqui."}</p>
            </div>
            <a class="primary-link" href="Bitacademy.html#quizzes"><i data-lucide="gamepad-2" data-lucide-size="18"></i> Ir para Arena de Prática</a>
          </div>
        </div>

        <div class="profile-card-section" style="margin-top: 24px;">
          <p class="eyebrow">Histórico gamificado</p>
          <h2>Melhores resultados por disciplina</h2>
          ${results.length ? `<div class="result-list" style="margin-top: 14px;">${results.map((result) => `
            <article>
              <div>
                <strong>${escapeHtml(result.titulo)}</strong>
                <span>Registrado em ${new Date(result.date).toLocaleDateString("pt-BR")}</span>
              </div>
              <b>${result.score}/${result.total} (${result.percent}%)</b>
            </article>
          `).join("")}</div>` : '<p>Você ainda não concluiu nenhum quiz. Escolha uma disciplina e comece quando quiser.</p>'}
        </div>
      </section>

      <section class="profile-tab-panel profile-card-section" data-profile-panel="boletim" hidden>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
          <div>
            <p class="eyebrow">Vida escolar</p>
            <h2>Boletim Acadêmico</h2>
            <p style="margin: 4px 0 0;">Acompanhe suas médias por período, notas de componentes avaliativos e situação anual em cada disciplina.</p>
          </div>
          ${gradeReports.length ? `<button type="button" class="btn-subtle no-print" data-print-gradebook><i data-lucide="printer" data-lucide-size="16"></i> Imprimir / Salvar Boletim PDF</button>` : ""}
        </div>
        <div class="gradebook-reports">
          ${gradeReportError ? `<p>${escapeHtml(gradeReportError)}</p>` : gradeReports.length ? gradeReports.map((report) => {
            const displayScore = report.finalScore !== null ? report.finalScore : report.annualAverage;
            const meterWidth = displayScore !== null ? Math.min(100, Math.max(0, displayScore * 10)) : 0;
            return `
              <article class="gradebook-report-card">
                <div class="gradebook-report-heading">
                  <div>
                    <strong>${escapeHtml(report.subject)}</strong>
                    <span>${escapeHtml(report.className)} · Ano letivo ${escapeHtml(report.year)} · Média mínima ${escapeHtml(report.passingScore)}/10</span>
                  </div>
                  <div class="grade-status-group">
                    <b class="grade-score-pill">${report.finalScore === null ? `Média parcial: ${report.annualAverage === null ? "—" : `${report.annualAverage.toFixed(2)}/10`}` : `Final: ${report.finalScore.toFixed(2)}/10`}</b>
                    ${statusBadgeForReport(report)}
                  </div>
                </div>
                <div class="grade-meter" aria-hidden="true"><div class="grade-meter-fill" style="width: ${meterWidth}%"></div></div>
                ${report.finalRecovery !== null ? `<p style="margin-top: 10px;">Nota de recuperação final: <strong>${report.finalRecovery.toFixed(2)}/10</strong> · Política: ${escapeHtml(report.finalRecoveryPolicy === "higher" ? "maior nota" : "média")}</p>` : ""}
                <div class="gradebook-period-list">
                  ${report.periods.map((period) => `
                    <section>
                      <div class="gradebook-period-heading">
                        <strong>${escapeHtml(period.sequence)}. ${escapeHtml(period.name)}</strong>
                        <span>Peso ${escapeHtml(period.weight)} · ${period.average === null ? "Sem média fechada" : `Média: ${period.average.toFixed(2)}/10`}</span>
                      </div>
                      <div class="gradebook-component-list">
                        ${period.components.map((component) => `
                          <section>
                            <div class="gradebook-period-heading">
                              <strong>${escapeHtml(component.name)}</strong>
                              <span>Peso ${escapeHtml(component.weight)}% · ${component.average === null ? "Sem média" : `${component.average.toFixed(2)}/10`}${component.pendingCount > 0 ? ` (parcial · ${component.pendingCount} pendente${component.pendingCount > 1 ? "s" : ""})` : ""}</span>
                            </div>
                            <div class="gradebook-assessment-list">
                              ${component.assessments.map((assessment) => `
                                <div>
                                  <span>${escapeHtml(assessment.title)} · peso interno ${escapeHtml(assessment.weight)}</span>
                                  <b>${assessment.gradeStatus === "excused" ? "Dispensado" : assessment.score === null ? "Aguardando nota" : `${assessment.score.toFixed(2)}/10`}</b>
                                  ${assessment.feedback ? `<small><i data-lucide="message-square" data-lucide-size="14"></i> Feedback: ${escapeHtml(assessment.feedback)}</small>` : ""}
                                </div>
                              `).join("")}
                            </div>
                          </section>
                        `).join("")}
                        ${period.recovery !== null ? `<div class="gradebook-assessment-list"><div><span>Recuperação do período</span><b>${period.recovery.toFixed(2)}/10</b></div></div>` : ""}
                      </div>
                    </section>
                  `).join("")}
                </div>
              </article>
            `;
          }).join("") : '<p>Seu boletim aparecerá aqui quando sua matrícula e suas disciplinas forem configuradas pela escola.</p>'}
        </div>
      </section>

      <section class="profile-tab-panel profile-card-section" data-profile-panel="atividades" hidden>
        <p class="eyebrow">Tarefas &amp; Trabalhos</p>
        <h2>Atividades &amp; Entregas</h2>
        <p style="margin-bottom: 20px;">Confira as orientações publicadas pelos seus professores, envie seus trabalhos e acompanhe correções e notas integradas ao boletim.</p>
        ${activitiesError ? `<p class="form-feedback error">${escapeHtml(activitiesError)}</p>` : availableActivities.length ? `
          <div class="activity-student-grid">
            ${availableActivities.map((activity) => {
              const isGraded = activity.submission_status === "graded";
              const isSubmitted = activity.submission_status === "submitted";
              const isPending = !isGraded && !isSubmitted;

              let statusBadge = "";
              if (isGraded) {
                statusBadge = `<span class="submission-badge graded"><i data-lucide="check-circle-2" data-lucide-size="15"></i> Avaliada</span>`;
              } else if (isSubmitted) {
                statusBadge = `<span class="submission-badge submitted"><i data-lucide="clock" data-lucide-size="15"></i> Entregue</span>`;
              } else {
                statusBadge = `<span class="submission-badge pending"><i data-lucide="alert-circle" data-lucide-size="15"></i> Pendente</span>`;
              }

              const formattedDue = activity.due_at ? new Date(activity.due_at).toLocaleDateString("pt-BR") : "Sem prazo fixo";
              const isOverdue = activity.due_at && new Date(activity.due_at) < new Date() && isPending;

              return `
                <article class="activity-student-card ${isOverdue ? 'overdue' : ''}">
                  <header class="activity-card-header">
                    <div>
                      <div class="activity-pill-tags">
                        <span class="pill-tag">${escapeHtml(activity.subject_name)}</span>
                        <span class="pill-tag subtle">Prof. ${escapeHtml(activity.teacher_name)}</span>
                        ${activity.assessment_id ? `<span class="pill-tag gradebook-badge"><i data-lucide="bar-chart-3" data-lucide-size="14"></i> Boletim Oficial</span>` : ""}
                        ${activity.activity_type === "automatic" ? `<span class="pill-tag auto-badge"><i data-lucide="zap" data-lucide-size="14"></i> Automática</span>` : ""}
                      </div>
                      <h3 class="activity-card-title">${escapeHtml(activity.title)}</h3>
                    </div>
                    <div class="activity-card-header-status">
                      ${statusBadge}
                      <span class="activity-due-text ${isOverdue ? 'text-danger' : ''}"><i data-lucide="calendar" data-lucide-size="13"></i> ${isOverdue ? 'Expirou em: ' : 'Prazo: '}${formattedDue}</span>
                    </div>
                  </header>

                  <div class="activity-card-description">
                    <p>${escapeHtml(activity.description)}</p>
                  </div>

                  <div class="activity-submission-zone">
                    ${isGraded ? `
                      <div class="submission-graded-box">
                        <div class="submission-score-row">
                          <div>
                            <span class="submission-score-label">Nota atribuída pelo professor:</span>
                            <div class="submission-score-value">
                              <strong>${Number(activity.submission_score).toFixed(2)}</strong> <span class="max-score">/ ${activity.assessment_id ? '10.00' : `${activity.max_score} pts`}</span>
                            </div>
                          </div>
                          ${activity.graded_at ? `<span class="submission-graded-date">Avaliado em ${new Date(activity.graded_at).toLocaleDateString("pt-BR")}</span>` : ""}
                        </div>
                        ${activity.submission_feedback ? `
                          <div class="submission-feedback-quote">
                            <span class="feedback-icon"><i data-lucide="message-square" data-lucide-size="18"></i></span>
                            <div>
                              <strong>Comentário &amp; Orientações:</strong>
                              <p>${escapeHtml(activity.submission_feedback)}</p>
                            </div>
                          </div>
                        ` : ""}
                        <div class="submission-records">
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link entregue:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} <i data-lucide="external-link" data-lucide-size="13"></i></a></p>` : ""}
                          ${activity.submission_content ? `<div class="submission-record-content"><strong>Conteúdo entregue:</strong><pre class="submission-content-box">${escapeHtml(activity.submission_content)}</pre></div>` : ""}
                        </div>
                      </div>
                    ` : isSubmitted ? `
                      <div class="submission-submitted-box">
                        <div class="submission-submitted-header">
                          <p><strong>Trabalho entregue com sucesso!</strong> Aguardando avaliação do professor.</p>
                          ${activity.submitted_at ? `<span class="submitted-timestamp">Envio: ${new Date(activity.submitted_at).toLocaleString("pt-BR")}</span>` : ""}
                        </div>
                        <div class="submission-records">
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link enviado:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} <i data-lucide="external-link" data-lucide-size="13"></i></a></p>` : ""}
                          ${activity.submission_content ? `<div class="submission-record-content"><strong>Texto/Resposta:</strong><pre class="submission-content-box">${escapeHtml(activity.submission_content)}</pre></div>` : ""}
                        </div>
                        ${activity.period_status === "closed" ? `
                          <p style="margin-top: 10px; font-size: 0.85rem; color: var(--cor-subtexto);"><i data-lucide="lock" data-lucide-size="14"></i> O período avaliativo já foi encerrado.</p>
                        ` : `
                          <div style="margin-top: 14px;">
                            <button type="button" class="btn-subtle" data-toggle-submission="${activity.id}"><i data-lucide="pencil" data-lucide-size="14"></i> Atualizar ou reenviar trabalho</button>
                          </div>
                          <div data-submission-form-container="${activity.id}" style="display: none; margin-top: 14px;">
                            <form class="activity-submit-form" data-activity-submit-form data-activity-id="${activity.id}">
                              <label>
                                <span>Atualizar texto ou anotações</span>
                                <textarea name="content" rows="3" placeholder="Escreva sua resposta ou considerações...">${escapeHtml(activity.submission_content || "")}</textarea>
                              </label>
                              <label>
                                <span>Atualizar link do trabalho (Google Drive, GitHub, Notion, etc.)</span>
                                <input type="url" name="link" value="${escapeHtml(activity.submission_link || "")}" placeholder="https://..." />
                              </label>
                              <div class="form-feedback" data-submission-msg></div>
                              <div class="form-actions-inline">
                                <button type="submit" class="primary-button small"><i data-lucide="send" data-lucide-size="14"></i> Salvar Nova Versão</button>
                              </div>
                            </form>
                          </div>
                        `}
                      </div>
                    ` : activity.period_status === "closed" ? `
                      <div class="submission-pending-box">
                        <p class="submission-pending-prompt" style="margin: 0; color: var(--cor-subtexto);"><i data-lucide="lock" data-lucide-size="14"></i> O período avaliativo desta atividade foi encerrado sem entrega registrada.</p>
                      </div>
                    ` : `
                      <div class="submission-pending-box">
                        ${activity.activity_type === "automatic" ? `
                          <div style="margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                            <strong style="color: #fbbf24; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><i data-lucide="zap" data-lucide-size="16"></i> Atividade com Correção Automática via Quiz</strong>
                            <p style="margin: 0 0 8px; font-size: 0.88rem; color: #e2e8f0;">Ao concluir o Quiz oficial de <strong>${escapeHtml(activity.subject_name)}</strong>, sua nota (0 a 10) é calculada e lançada automaticamente nesta atividade e no boletim!</p>
                            <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="primary-link" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.84rem;">Realizar Quiz de ${escapeHtml(activity.subject_name)} <i data-lucide="arrow-right" data-lucide-size="14"></i></a>
                          </div>
                        ` : ""}
                        <p class="submission-pending-prompt">Envie sua resposta ou link do trabalho para avaliação:</p>
                        <form class="activity-submit-form" data-activity-submit-form data-activity-id="${activity.id}">
                          <label>
                            <span>Texto da resposta / Resolução</span>
                            <textarea name="content" rows="3" placeholder="Escreva aqui sua resposta, reflexão ou anotações..."></textarea>
                          </label>
                          <label>
                            <span>Link do trabalho externo (Google Docs/Drive, GitHub, PDF, etc.)</span>
                            <input type="url" name="link" placeholder="https://..." />
                          </label>
                          <div class="form-feedback" data-submission-msg></div>
                          <div class="form-actions-inline">
                            <button type="submit" class="primary-button small"><i data-lucide="send" data-lucide-size="14"></i> Enviar Atividade</button>
                          </div>
                        </form>
                      </div>
                    `}
                  </div>

                  <footer class="activity-card-footer">
                    <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="card-link-muted">Ver material da disciplina <i data-lucide="arrow-right" data-lucide-size="14"></i></a>
                    <span class="activity-points-pill">${escapeHtml(activity.max_score)} pts máx</span>
                  </footer>
                </article>
              `;
            }).join("")}
          </div>
        ` : '<p>Nenhuma atividade foi disponibilizada pelos professores até o momento.</p>'}
      </section>
    `;

    const profileTabs = container.querySelectorAll("[data-profile-tab]");
    const profilePanels = container.querySelectorAll("[data-profile-panel]");

    const animateProfileTab = (target) => {
      const M = window.BitAcademyMotion;
      if (!M) return;
      const activePanel = container.querySelector(`[data-profile-panel="${target}"]`);
      if (!activePanel) return;
      M.panelIn(activePanel);
      if (target === "resumo") {
        M.staggerCards(activePanel, ".profile-summary article", { stagger: 0.06, y: 14 });
        M.staggerCards(activePanel, ".result-list article", { stagger: 0.05, y: 14 });
        const summaryNums = activePanel.querySelectorAll(".profile-summary strong");
        if (summaryNums[0]) M.countUp(summaryNums[0], results.length);
        if (summaryNums[1]) M.countUp(summaryNums[1], average, { suffix: "%" });
        if (summaryNums[2]) M.countUp(summaryNums[2], bestPercent, { suffix: "%" });
        if (summaryNums[3]) M.countUp(summaryNums[3], bestGameScore);
      } else if (target === "boletim") {
        M.staggerCards(activePanel, ".gradebook-report-card", { stagger: 0.07, y: 18 });
        M.animateMeters(activePanel);
      } else if (target === "atividades") {
        M.staggerCards(activePanel, ".activity-student-card", { stagger: 0.065, y: 18 });
      }
    };

    const switchTab = (target) => {
      profileTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.profileTab === target));
      profilePanels.forEach((panel) => {
        panel.hidden = panel.dataset.profilePanel !== target;
      });
      animateProfileTab(target);
    };

    window.BitAcademyMotion?.panelIn(container.querySelector(".profile-hero"));
    switchTab(activeTab);

    profileTabs.forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.profileTab));
    });

    container.querySelector("[data-print-gradebook]")?.addEventListener("click", () => {
      window.print();
    });

    container.querySelectorAll("[data-activity-submit-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const activityId = form.dataset.activityId;
        const content = form.content ? form.content.value.trim() : "";
        const link = form.link ? form.link.value.trim() : "";
        const submitBtn = form.querySelector("button[type='submit']");
        const msgEl = form.querySelector("[data-submission-msg]");

        if (!content && !link) {
          if (msgEl) {
            msgEl.textContent = "Por favor, preencha ao menos uma resposta em texto ou informe um link.";
            msgEl.className = "form-feedback error";
          }
          window.BitAcademyMotion?.shake(form);
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";
          }
          if (msgEl) {
            msgEl.textContent = "";
            msgEl.className = "form-feedback";
          }

          await api("academic?action=submit-activity", {
            method: "POST",
            body: JSON.stringify({ activityId, content, link })
          });

          await renderProfile("atividades");
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Tentar novamente";
          }
          if (msgEl) {
            msgEl.textContent = err.message || "Erro ao enviar atividade.";
            msgEl.className = "form-feedback error";
          }
          window.BitAcademyMotion?.shake(form);
        }
      });
    });

    container.querySelectorAll("[data-toggle-submission]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggleSubmission;
        const target = container.querySelector(`[data-submission-form-container="${id}"]`);
        if (target) {
          const isHidden = target.style.display === "none";
          target.style.display = isHidden ? "block" : "none";
          if (isHidden) window.BitAcademyMotion?.drawerIn(target);
          btn.innerHTML = isHidden
            ? '<i data-lucide="x" data-lucide-size="14"></i> Cancelar edição'
            : '<i data-lucide="pencil" data-lucide-size="14"></i> Atualizar ou reenviar trabalho';
        }
      });
    });
  };

  const bindLoginPage = () => {
    const tabs = document.querySelectorAll("[data-auth-tab]");
    const panels = document.querySelectorAll("[data-auth-panel]");
    const messageBox = document.querySelector("[data-auth-message-box]");
    const messageIcon = document.querySelector("[data-auth-message-icon]");
    const message = document.querySelector("[data-auth-message]");
    const recoveryNotice = document.querySelector("[data-recovery-notice]");
    if (!tabs.length && !panels.length) return;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setBannerMessage = (text, type = "error") => {
      if (!message) return;
      message.textContent = text || "";
      if (!messageBox) return;
      if (!text) {
        messageBox.hidden = true;
        messageBox.className = "form-message-banner";
        return;
      }
      messageBox.hidden = false;
      messageBox.className = `form-message-banner is-${type}`;
      if (messageIcon) {
        const iconName = type === "success" ? "check-circle-2" : "alert-circle";
        messageIcon.innerHTML = window.BitAcademyIcons.svg(iconName, 18);
      }
      window.BitAcademyMotion?.drawerIn(messageBox);
    };

    const getFieldGroup = (input) => input?.closest(".field-group");

    const clearFieldState = (input) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-error", "is-valid");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) statusEl.innerHTML = "";
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl && !errorEl.hasAttribute("data-match-status")) {
        errorEl.textContent = "";
      }
    };

    const setFieldError = (input, errorText, shouldShake = true) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-valid");
      group.classList.add("is-error");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) {
        statusEl.innerHTML = window.BitAcademyIcons.svg("alert-circle", 17);
      }
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl) {
        errorEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>${escapeHtml(errorText)}</span>`;
      }
      if (shouldShake) {
        const target = group.querySelector(".input-with-icon") || group;
        window.BitAcademyMotion?.shake(target);
      }
    };

    const setFieldValid = (input) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-error");
      group.classList.add("is-valid");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) {
        statusEl.innerHTML = window.BitAcademyIcons.svg("check-circle-2", 17);
        window.BitAcademyMotion?.pop(statusEl);
      }
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl && !errorEl.hasAttribute("data-match-status")) {
        errorEl.textContent = "";
      }
    };

    const evaluatePasswordRules = (pwd) => {
      const byteLength = new TextEncoder().encode(pwd).length;
      return {
        length: pwd.length >= 8 && byteLength <= 72,
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        number: /\d/.test(pwd),
        symbol: /[^A-Za-z0-9À-ÿ]/.test(pwd)
      };
    };

    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authTab === target));
      panels.forEach((panel) => {
        const isMatch = panel.dataset.authPanel === target;
        panel.hidden = !isMatch;
        if (isMatch) window.BitAcademyMotion?.panelIn(panel);
      });
      setBannerMessage("");
      if (recoveryNotice) recoveryNotice.hidden = true;
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.authTab)));

    document.querySelector("[data-forgot-password]")?.addEventListener("click", () => {
      if (recoveryNotice) {
        recoveryNotice.hidden = !recoveryNotice.hidden;
        if (!recoveryNotice.hidden) window.BitAcademyMotion?.drawerIn(recoveryNotice);
      }
      setBannerMessage("");
    });

    // Toggle Mostrar / Ocultar senha com ícones eye e eye-off
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.innerHTML = `${window.BitAcademyIcons.svg(show ? "eye-off" : "eye", 16)} <span>${show ? "Ocultar" : "Mostrar"}</span>`;
        button.setAttribute("aria-label", `${show ? "Ocultar" : "Mostrar"} senha`);
        window.BitAcademyMotion?.pop(button);
      });
    });

    // Detector de Caps Lock em campos de senha
    document.querySelectorAll('.login-form input[type="password"]').forEach((pwdInput) => {
      const group = getFieldGroup(pwdInput);
      const capsWarning = group?.querySelector("[data-caps-warning]");
      if (!capsWarning) return;
      const checkCaps = (event) => {
        if (typeof event.getModifierState !== "function") return;
        const isCaps = event.getModifierState("CapsLock");
        capsWarning.hidden = !isCaps;
      };
      pwdInput.addEventListener("keydown", checkCaps);
      pwdInput.addEventListener("keyup", checkCaps);
      pwdInput.addEventListener("blur", () => { capsWarning.hidden = true; });
    });

    // Validação guiada em tempo real para campos de Nome e E-mail
    document.querySelectorAll('#login-email, #cadastro-email').forEach((emailInput) => {
      emailInput.addEventListener("input", () => {
        const val = emailInput.value.trim();
        if (!val) {
          clearFieldState(emailInput);
          return;
        }
        if (EMAIL_REGEX.test(val)) {
          setFieldValid(emailInput);
        } else if (getFieldGroup(emailInput)?.classList.contains("is-error")) {
          clearFieldState(emailInput);
        }
      });
      emailInput.addEventListener("blur", () => {
        const val = emailInput.value.trim();
        if (!val) return;
        if (!EMAIL_REGEX.test(val)) {
          setFieldError(emailInput, "Informe um e-mail válido (ex.: nome@escola.com).", false);
        } else {
          setFieldValid(emailInput);
        }
      });
    });

    const registerNameInput = document.getElementById("cadastro-nome");
    if (registerNameInput) {
      registerNameInput.addEventListener("input", () => {
        const val = registerNameInput.value.trim();
        if (val.length >= 3) {
          setFieldValid(registerNameInput);
        } else {
          clearFieldState(registerNameInput);
        }
      });
      registerNameInput.addEventListener("blur", () => {
        const val = registerNameInput.value.trim();
        if (val && val.length < 2) {
          setFieldError(registerNameInput, "Digite seu nome e sobrenome (mínimo 2 caracteres).", false);
        }
      });
    }

    const loginPwdInput = document.getElementById("login-senha");
    if (loginPwdInput) {
      loginPwdInput.addEventListener("input", () => {
        if (loginPwdInput.value.length > 0) clearFieldState(loginPwdInput);
      });
    }

    // Medidor de força de senha + Checklist interativo + Confirmação em tempo real
    const registerPwdInput = document.getElementById("cadastro-senha");
    const confirmPwdInput = document.getElementById("cadastro-confirma-senha");
    const checklistEl = document.querySelector("[data-password-checklist]");
    const strengthBarsEl = document.querySelector("[data-strength-bars]");
    const strengthLabelEl = document.querySelector("[data-strength-label]");
    const matchStatusEl = document.querySelector("[data-match-status]");

    const updateConfirmMatch = () => {
      if (!confirmPwdInput || !registerPwdInput || !matchStatusEl) return;
      const pwd = registerPwdInput.value;
      const confirm = confirmPwdInput.value;
      const group = getFieldGroup(confirmPwdInput);
      if (!confirm) {
        group?.classList.remove("is-error", "is-valid");
        matchStatusEl.textContent = "";
        return;
      }
      if (pwd === confirm) {
        group?.classList.remove("is-error");
        group?.classList.add("is-valid");
        matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("check-circle-2", 13)} <span>As senhas coincidem perfeitamente</span>`;
      } else {
        group?.classList.remove("is-valid");
        group?.classList.add("is-error");
        matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>As senhas ainda não coincidem</span>`;
      }
    };

    if (registerPwdInput) {
      registerPwdInput.addEventListener("input", () => {
        const pwd = registerPwdInput.value;
        const rules = evaluatePasswordRules(pwd);
        const passedCount = Object.values(rules).filter(Boolean).length;

        if (checklistEl) {
          Object.entries(rules).forEach(([ruleKey, isMet]) => {
            const item = checklistEl.querySelector(`[data-rule="${ruleKey}"]`);
            if (!item) return;
            const wasMet = item.classList.contains("is-met");
            item.classList.toggle("is-met", isMet);
            const iconHolder = item.querySelector(".rule-icon");
            if (iconHolder) {
              iconHolder.innerHTML = window.BitAcademyIcons.svg(isMet ? "check-circle-2" : "circle", 13);
              if (isMet && !wasMet) window.BitAcademyMotion?.pop(iconHolder);
            }
          });
        }

        let level = 0;
        let label = "Força da senha";
        if (pwd.length > 0) {
          if (passedCount <= 2) {
            level = 1;
            label = "Senha fraca";
          } else if (passedCount === 3) {
            level = 2;
            label = "Senha razoável";
          } else if (passedCount === 4) {
            level = 3;
            label = "Senha boa";
          } else if (passedCount === 5) {
            level = 4;
            label = "Senha forte";
          }
        }

        if (strengthBarsEl) {
          strengthBarsEl.dataset.level = String(level);
        }
        if (strengthLabelEl) {
          strengthLabelEl.textContent = label;
          strengthLabelEl.dataset.level = String(level);
        }

        const group = getFieldGroup(registerPwdInput);
        if (passedCount === 5) {
          group?.classList.remove("is-error");
          group?.classList.add("is-valid");
          const errEl = group?.querySelector("[data-field-error]");
          if (errEl) errEl.textContent = "";
        } else if (group?.classList.contains("is-valid")) {
          group.classList.remove("is-valid");
        }

        if (confirmPwdInput?.value) updateConfirmMatch();
      });
    }

    if (confirmPwdInput) {
      confirmPwdInput.addEventListener("input", updateConfirmMatch);
    }

    // Submit do Login com validação guiada por campo
    document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const emailInput = form.email;
      const pwdInput = form.senha;
      const submitBtn = form.querySelector("[data-submit-btn]");
      setBannerMessage("");

      let hasError = false;
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        setFieldError(emailInput, "Digite seu e-mail para continuar.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        setFieldError(emailInput, "Formato de e-mail inválido (ex.: aluno@escola.com).");
        hasError = true;
      } else {
        setFieldValid(emailInput);
      }

      if (!pwdInput.value) {
        setFieldError(pwdInput, "Digite sua senha de acesso.");
        hasError = true;
      } else {
        clearFieldState(pwdInput);
      }

      if (hasError) {
        setBannerMessage("Verifique os campos destacados em vermelho antes de entrar.", "error");
        const firstErr = form.querySelector(".field-group.is-error input");
        firstErr?.focus();
        return;
      }

      const originalBtnHtml = submitBtn?.innerHTML;
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `${window.BitAcademyIcons.svg("refresh-cw", 18, "spin-icon")} <span>Autenticando...</span>`;
        }
        const user = await login({ email: emailVal, password: pwdInput.value });
        setBannerMessage(`Bem-vindo(a), ${user.name}! Redirecionando...`, "success");
        window.location.href = user.type === "Administrador" ? "admin.html" : user.type === "Professor" ? "professor.html" : "perfil.html";
      } catch (error) {
        if (submitBtn && originalBtnHtml) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        setBannerMessage(error.message || "E-mail ou senha incorretos.", "error");
        setFieldError(pwdInput, "Confira se a senha e o e-mail estão corretos.", false);
        window.BitAcademyMotion?.shake(form);
        pwdInput.focus();
      }
    });

    // Submit do Cadastro com validação guiada por campo
    document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const nameInput = form.nome;
      const emailInput = form.email;
      const pwdInput = form.senha;
      const confirmInput = form.confirmaSenha;
      const submitBtn = form.querySelector("[data-submit-btn]");
      setBannerMessage("");

      let hasError = false;
      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const password = pwdInput.value;
      const confirmation = confirmInput.value;

      if (!nameVal || nameVal.length < 2) {
        setFieldError(nameInput, "Informe seu nome completo (mínimo 2 caracteres).");
        hasError = true;
      } else {
        setFieldValid(nameInput);
      }

      if (!emailVal) {
        setFieldError(emailInput, "Informe um e-mail para sua conta.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        setFieldError(emailInput, "Informe um e-mail válido (ex.: nome@escola.com).");
        hasError = true;
      } else {
        setFieldValid(emailInput);
      }

      const rules = evaluatePasswordRules(password);
      const strongPassword = Object.values(rules).every(Boolean);
      if (!strongPassword) {
        setFieldError(pwdInput, "Complete todos os 5 requisitos da lista acima para proteger sua conta.");
        hasError = true;
      }

      if (!confirmation || password !== confirmation) {
        const group = getFieldGroup(confirmInput);
        group?.classList.remove("is-valid");
        group?.classList.add("is-error");
        if (matchStatusEl) {
          matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>As senhas não coincidem. Digite a mesma senha nos dois campos.</span>`;
        }
        window.BitAcademyMotion?.shake(group?.querySelector(".input-with-icon") || group);
        hasError = true;
      }

      if (hasError) {
        setBannerMessage("Revise os campos destacados para concluir seu cadastro.", "error");
        const firstErr = form.querySelector(".field-group.is-error input");
        firstErr?.focus();
        return;
      }

      const originalBtnHtml = submitBtn?.innerHTML;
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `${window.BitAcademyIcons.svg("refresh-cw", 18, "spin-icon")} <span>Criando sua conta...</span>`;
        }
        await register({
          name: nameVal,
          email: emailVal,
          password
        });
        setBannerMessage("Conta criada com sucesso! Acessando seu perfil...", "success");
        window.location.href = "perfil.html";
      } catch (error) {
        if (submitBtn && originalBtnHtml) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        setBannerMessage(error.message || "Não foi possível criar a conta.", "error");
        if (String(error.message || "").toLowerCase().includes("e-mail")) {
          setFieldError(emailInput, error.message);
        } else {
          window.BitAcademyMotion?.shake(form);
        }
      }
    });
  };

  const bindHomeTabs = () => {
    const tabs = document.querySelectorAll("[data-home-tab]");
    const panels = document.querySelectorAll("[data-home-panel]");
    if (!tabs.length || !panels.length) return;
    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.homeTab === target));
      panels.forEach((panel) => {
        const active = panel.dataset.homePanel === target;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
        if (active) {
          window.BitAcademyMotion?.panelIn(panel);
          window.BitAcademyMotion?.staggerCards(panel, ".subject-preview span", { stagger: 0.06, y: 10 });
        }
      });
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.homeTab)));
  };

  const loadSubjectCatalog = async () => {
    const grid = document.querySelector("[data-subject-catalog]");
    if (!grid) return;
    const status = document.querySelector("[data-subject-catalog-status]");
    try {
      const data = await api("academic?action=subjects");
      const subjects = data.subjects || [];
      grid.innerHTML = subjects.length ? subjects.map((subject) => `
        <article class="subject-card" data-accent="${escapeHtml(subject.slug)}">
          <span class="subject-icon">${window.BitAcademyIcons.forSubject(subject.slug, subject.icon, 24)}</span>
          <strong>${escapeHtml(subject.name)}</strong>
          <span>${escapeHtml(subject.description || "Conteúdos e materiais para estudar esta disciplina.")}</span>
          <a href="materia.html?slug=${encodeURIComponent(subject.slug)}">Estudar <i data-lucide="arrow-right" data-lucide-size="16"></i></a>
        </article>
      `).join("") : '<p>Nenhuma disciplina disponível no momento.</p>';
      const count = document.querySelector("[data-overview-subjects], .home-overview article:first-child strong");
      if (count) {
        count.textContent = subjects.length;
        window.BitAcademyMotion?.countUp(count, subjects.length);
      }
      if (status) status.textContent = `${subjects.length} disciplinas sincronizadas do catálogo.`;
      window.BitAcademyMotion?.inView(grid, () => window.BitAcademyMotion?.staggerCards(grid, ".subject-card", { stagger: 0.055 }));
    } catch (error) {
      if (status) status.textContent = "Exibindo as disciplinas disponíveis no portal.";
      window.BitAcademyMotion?.inView(grid, () => window.BitAcademyMotion?.staggerCards(grid, ".subject-card", { stagger: 0.055 }));
      console.warn("Não foi possível carregar o catálogo de disciplinas:", error.message);
    }
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-auth-logout]")) logout();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    window.BitAcademyMotion?.initPageAnimations();
    await ready;
    bindLoginPage();
    bindHomeTabs();
    renderAuthStatus();
    loadSubjectCatalog();
    await renderProfile();
  });

  return {
    ready,
    getCurrentUser,
    renderAuthStatus,
    getGameRanking,
    recordGameScore,
    getProgress,
    getQuizRanking,
    startGame,
    submitGameAnswer,
    finishGame,
    abortGame,
    login,
    logout,
    recordQuizResult,
    register,
    getUserGameScores
  };
})();
