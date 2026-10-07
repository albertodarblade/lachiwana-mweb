// Smart notes store a single HTML document in `sandboxCode`. The editor shows
// exactly what is stored — what you type is what is saved (round-trip safe).
// For preview we only need to wrap bare fragments (`<h1>Hola</h1>`) in a minimal
// document so the iframe gets a proper viewport; full documents run as-is.

export function toPreviewDoc(raw) {
  const code = raw ?? ''
  if (!code.trim()) return ''
  // Already a document (legacy assembled notes or user-written full HTML).
  if (/<html[\s>]/i.test(code)) return code
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
${code}
</body>
</html>`
}
