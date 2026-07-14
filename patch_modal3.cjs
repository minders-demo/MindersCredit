const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

code = code.replace(
  'amplitudeService.track("error_validacion", { campo: "login_rut", mensaje: "RUT vacío" });',
  'amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "rut_invalido" });'
);

code = code.replace(
  'amplitudeService.track("error_validacion", { campo: "login_rut", mensaje: "RUT inválido" });',
  'amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "rut_invalido" });'
);

code = code.replace(
  'amplitudeService.track("error_validacion", { campo: "login_password", mensaje: "Clave vacía" });',
  'amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "clave_incorrecta" });'
);

fs.writeFileSync('src/components/LoginModal.tsx', code);
