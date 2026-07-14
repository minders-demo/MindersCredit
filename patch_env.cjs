const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf-8');

code += `\n# Amplitude (estas llaves client-side son publicas por disenyo)
VITE_AMPLITUDE_API_KEY=
VITE_AMPLITUDE_DEPLOYMENT_KEY=
`;
fs.writeFileSync('.env.example', code);
