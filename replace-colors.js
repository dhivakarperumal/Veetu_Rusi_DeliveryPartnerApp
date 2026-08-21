const fs = require('fs');

const files = [
  'app/home.tsx',
  'app/orders.tsx',
  'app/order-details.tsx',
  'app/earnings.tsx',
  'app/profile.tsx',
  'app/track-order.tsx',
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Remove 'top' from edges so TopHeader handles the safe area with its green bg
  const updated = content.replace(
    /edges={\[['"]top['"],\s*['"]left['"],\s*['"]right['"]\]}/g,
    "edges={['left', 'right', 'bottom']}"
  );
  if (updated !== content) {
    fs.writeFileSync(f, updated, 'utf8');
    console.log('Updated:', f);
  }
});
