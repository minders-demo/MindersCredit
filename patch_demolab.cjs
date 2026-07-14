const fs = require('fs');
let code = fs.readFileSync('src/views/DemoLab.tsx', 'utf-8');

code = code.replace(
  'const [apiKey, setApiKey] = useState((import.meta as any).env.VITE_AMPLITUDE_API_KEY || "");',
  'const [apiKey, setApiKey] = useState((import.meta as any).env.VITE_AMPLITUDE_API_KEY || "cce51808526c9ce95082ce3d4ac97106");'
);

fs.writeFileSync('src/views/DemoLab.tsx', code);
