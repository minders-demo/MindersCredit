const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(
  'customer_segment: "socio_activo" | "pensionado" | "socio_nuevo";\n}',
  'customer_segment: "socio_activo" | "pensionado" | "socio_nuevo";\n  region: string;\n}'
);

code = code.replace(
  /export const DEMO_USERS: DemoUser\[\] = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\];/,
  `export const DEMO_USERS: DemoUser[] = [
  { auth_uid: "uid_demo_camila", customer_id: "cust_demo_camila", rut_normalized: "123456785", password: "Demo1234", first_name: "Camila", last_name: "Rojas", customer_segment: "socio_activo", region: "Metropolitana" },
  { auth_uid: "uid_demo_jorge",  customer_id: "cust_demo_jorge", rut_normalized: "98765433", password: "Demo1234", first_name: "Jorge",  last_name: "Fuentes", customer_segment: "pensionado", region: "Valparaíso" },
  { auth_uid: "uid_demo_rosa",   customer_id: "cust_demo_rosa", rut_normalized: "156789012", password: "Demo1234", first_name: "Rosa",   last_name: "Espinoza", customer_segment: "socio_nuevo", region: "Biobío" }
];`
);

fs.writeFileSync('src/data.ts', code);
