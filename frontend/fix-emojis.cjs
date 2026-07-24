const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/kasir/ProductOrderForm.jsx',
  'src/pages/FinancePage.jsx',
  'src/pages/MasterDataPage.jsx',
  'src/pages/PosFbPage.jsx',
  'src/pages/PosPsPage.jsx',
  'src/pages/ReportPage.jsx',
  'src/components/kasir/ShiftPanel.jsx',
  'src/pages/DashboardPage.jsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find single-quoted strings that contain the injected lucide icon
  // e.g. '<Coins size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />'
  // But wait, it's malformed: '<Coins size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />'
  // Let's just match the pattern:
  // /'<\w+ size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} \/>'/g
  
  const regex = /'<(\w+) size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} \/>'/g;
  
  content = content.replace(regex, (match, iconName) => {
    // If it's used as an icon prop, it should probably be a JSX element, not a string
    return `<${iconName} size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />`;
  });

  // Also fix double-quoted strings
  const regex2 = /"<(\w+) size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} \/>"/g;
  content = content.replace(regex2, (match, iconName) => {
    return `<${iconName} size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />`;
  });

  // Wait, in DashboardPage it was {voiceEnabled ? '🟢 Suara aktif' : '🔴 Suara mati'}
  // Which became: {voiceEnabled ? '<ToggleRight size={16} ... /> Suara aktif' : '<ToggleLeft ... /> Suara mati'}
  // That also breaks because of inner single quotes.
  // Let's fix that specific pattern.
  const regex3 = /'<\w+ size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} \/>([^']+)'/g;
  content = content.replace(regex3, (match, p1) => {
    // Just remove the injected icon from the string and use standard text or fix it
    return match; // Wait, actually it's easier to just find the broken lines manually if there are only a few.
  });

  fs.writeFileSync(filePath, content, 'utf8');
});
