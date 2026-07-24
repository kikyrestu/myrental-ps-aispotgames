const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🎮': 'Gamepad2',
  '📊': 'LayoutDashboard',
  '💻': 'MonitorPlay',
  '🍔': 'Utensils',
  '💸': 'Wallet',
  '📁': 'Database',
  '🏷️': 'Tags',
  '📦': 'Archive',
  '📈': 'LineChart',
  '🤝': 'Handshake',
  '💰': 'Coins',
  '🚪': 'LogOut',
  '✅': 'CheckCircle',
  '❌': 'XCircle',
  '⏳': 'Clock',
  '⚠️': 'AlertTriangle',
  '🔥': 'Flame',
  '🔔': 'Bell',
  '➕': 'Plus',
  '➖': 'Minus',
  '🗑️': 'Trash2',
  '✏️': 'Edit2',
  '🔍': 'Search',
  '👥': 'Users',
  '👤': 'User',
  '⚙️': 'Settings',
  '🧾': 'Receipt',
  '🛒': 'ShoppingCart',
  '🔊': 'Volume2',
  '🟢': 'ToggleRight',
  '🔴': 'ToggleLeft',
  '💳': 'CreditCard',
  '💵': 'Banknote',
  '📝': 'FileText',
  '🛑': 'StopCircle',
  '🕹️': 'Joystick',
  '🕹': 'Joystick',
  '⚠️': 'AlertTriangle',
  '🎮': 'Gamepad2'
};

const regexStr = Object.keys(emojiMap).join('|');
const regex = new RegExp(`(${regexStr})`, 'g');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let iconsNeeded = new Set();
  let modified = false;

  const newContent = content.replace(regex, (match) => {
    const iconName = emojiMap[match];
    if (iconName) {
      iconsNeeded.add(iconName);
      modified = true;
      return `<${iconName} size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />`;
    }
    return match;
  });

  if (modified) {
    let finalContent = newContent;
    // Check if lucide-react is imported
    const importRegex = /import\s+{[^}]+}\s+from\s+['"]lucide-react['"]/g;
    let existingImport = importRegex.exec(finalContent);

    if (existingImport) {
      // Append new icons to existing import
      let existingIconsStr = existingImport[0].match(/{([^}]+)}/)[1];
      let existingIcons = existingIconsStr.split(',').map(s => s.trim());
      iconsNeeded.forEach(icon => {
        if (!existingIcons.includes(icon)) {
          existingIcons.push(icon);
        }
      });
      const newImport = `import { ${existingIcons.join(', ')} } from 'lucide-react'`;
      finalContent = finalContent.replace(existingImport[0], newImport);
    } else {
      // Add new import after the first import statement or at the top
      const newImport = `import { ${Array.from(iconsNeeded).join(', ')} } from 'lucide-react';\n`;
      // Find last import
      const lastImportIndex = Array.from(finalContent.matchAll(/import .* from .*\n/g)).pop();
      if (lastImportIndex) {
        const insertPos = lastImportIndex.index + lastImportIndex[0].length;
        finalContent = finalContent.slice(0, insertPos) + newImport + finalContent.slice(insertPos);
      } else {
        finalContent = newImport + finalContent;
      }
    }
    
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`Updated ${filePath} with ${Array.from(iconsNeeded).join(', ')}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src'));
