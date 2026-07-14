const fs = require('fs');
let code = fs.readFileSync('src/views/OnboardingSocio.tsx', 'utf-8');

code = code.replace(/<input/g, '<input data-amp-mask');

fs.writeFileSync('src/views/OnboardingSocio.tsx', code);
