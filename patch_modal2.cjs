const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

code = code.replace(
  'amplitudeService.track("crear_clave_completado", { rut: registerRut });',
  'amplitudeService.track("crear_clave_completado");'
);

fs.writeFileSync('src/components/LoginModal.tsx', code);
