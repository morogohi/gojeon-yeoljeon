import { ART } from '../src/content/art';
import { writeFileSync } from 'fs';
const html = `<!DOCTYPE html><html><body style="margin:0;background:#ddd;display:grid;grid-template-columns:repeat(3,320px);gap:8px;padding:8px">` +
  Object.entries(ART).map(([k, v]) => `<div><div style="width:320px">${v.svg}</div><small>${k}</small></div>`).join('') + `</body></html>`;
writeFileSync('/tmp/art.html', html);
