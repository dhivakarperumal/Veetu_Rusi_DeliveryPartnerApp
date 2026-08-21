const fs = require('fs');

function fix(filePath, fn) {
  if (!fs.existsSync(filePath)) return;
  let c = fs.readFileSync(filePath, 'utf8');
  let updated = fn(c);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Fixed', filePath);
}

fix('app/index.tsx', c => c.replace(/text-\[#782D16\]/g, 'text-accent-darkBrown'));

fix('app/track-order.tsx', c => c
  .replace(/bg-\[#A1C9A1\]/g, 'bg-primary-mutedGreen')
  .replace(/border-\[#5E3F22\]/g, 'border-accent-brown')
  .replace(/bg-\[#D32F2F\]/g, 'bg-status-error')
);

fix('app/earnings.tsx', c => c.replace(/border-\[#DC9441\]/g, 'border-accent-golden'));

fix('app/src/Buttombar/BottomBar.tsx', c => {
  let result = c
    .replace(/"#304B26"/g, 'Colors.primary.darkGreen')
    .replace(/"#8F8F8F"/g, 'Colors.text.muted');
  if (!result.includes('import { Colors }')) {
    result = "import { Colors } from '../../constants/Colors';\n" + result;
  }
  return result;
});
