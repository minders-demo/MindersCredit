const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

code = code.replace(/<input/g, '<input data-amp-mask');

fs.writeFileSync('src/components/LoginModal.tsx', code);
