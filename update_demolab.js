const fs = require('fs');

let content = fs.readFileSync('src/views/DemoLab.tsx', 'utf8');

// 1. Add "educa" tab
content = content.replace(
  '{ id: "consumo", label: "Crédito de Consumo" },',
  '{ id: "consumo", label: "Crédito de Consumo" },\n    { id: "educa", label: "Educa" },'
);

// 2. Add 'Caso Coopeuch' preset for Consumo
content = content.replace(
  'Configuración Global',
  'Configuración Global'
);
// Actually, let's just add it dynamically inside the UI
// I will rewrite the component parts with standard replace.
