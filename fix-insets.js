const fs = require('fs');

const files = [
  'app/personal-info.tsx',
  'app/vehicle-info.tsx',
  'app/documents.tsx',
  'app/bank-details.tsx',
  'app/helpsupport.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Ensure useSafeAreaInsets is imported
  if (!content.includes('useSafeAreaInsets')) {
    content = content.replace(
      "import { SafeAreaView } from 'react-native-safe-area-context';",
      "import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';"
    );
  }

  // Inject insets into the component
  content = content.replace(
    /(export default function [A-Za-z]+\(\) \{[\s\S]*?const router = useRouter\(\);)/,
    "$1\n  const insets = useSafeAreaInsets();"
  );

  // Replace hardcoded padding with dynamic inset padding
  content = content.replace(
    /style=\{\{ paddingTop: 52, backgroundColor: Colors\.primary\.darkGreen \}\}/,
    "style={{ paddingTop: Math.max(insets.top + 8, 20), backgroundColor: Colors.primary.darkGreen, paddingBottom: 16 }}"
  );

  fs.writeFileSync(f, content, 'utf8');
  console.log('Updated:', f);
});
