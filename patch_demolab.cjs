const fs = require('fs');
let code = fs.readFileSync('src/views/DemoLab.tsx', 'utf-8');

code = code.replace(
  'const [apiKey, setApiKey] = useState((import.meta as any).env.VITE_AMPLITUDE_API_KEY || "");',
  'const [apiKey, setApiKey] = useState((import.meta as any).env.VITE_AMPLITUDE_API_KEY || "714214e5842a299f3fa47e23db5fe728");'
);

fs.writeFileSync('src/views/DemoLab.tsx', code);
