const fs = require('fs');

function cleanFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  // Since we prepended 'data-amp-mask', let's fix <input data-amp-mask ... data-amp-mask="true" />
  code = code.replace(/<input data-amp-mask([\s\S]*?)data-amp-mask="true"/g, '<input data-amp-mask$1');
  fs.writeFileSync(filePath, code);
}

cleanFile('src/components/LoginModal.tsx');
cleanFile('src/views/OnboardingSocio.tsx');
