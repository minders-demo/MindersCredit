const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf-8');

// 1. Rename modal open event
code = code.replace(
  'amplitudeService.track("login_started", { context: "modal_trigger" });',
  'amplitudeService.track("login_abierto");'
);

// 2. Remove rut from recuperar_clave_completado
code = code.replace(
  'amplitudeService.track("recuperar_clave_completado", { rut: recoveryRut });',
  'amplitudeService.track("recuperar_clave_completado");'
);

// 3. Remove rut from crear_clave_completado
code = code.replace(
  'amplitudeService.track("crear_clave_completado", { rut: formatRut(registerRut) });',
  'amplitudeService.track("crear_clave_completado");'
);

// 4. Update the autofill section
const oldAutofill = `  const handleAutofill = () => {
    // Para facilitar las pruebas, autofill ingresa directamente los datos de Camila Rojas (Usuario Demo 1)
    setRut("12.345.678-5");
    setPassword("Demo1234");
    amplitudeService.track("autofill_demo_clicked", { form: "login", test_user: "camila" });
  };`;

const newAutofill = `  const handleAutofill = (test_user: "camila" | "jorge" | "rosa") => {
    if (test_user === "camila") {
      setRut("12.345.678-5");
      setPassword("Demo1234");
    } else if (test_user === "jorge") {
      setRut("9.876.543-3");
      setPassword("Demo1234");
    } else if (test_user === "rosa") {
      setRut("15.678.901-2");
      setPassword("Demo1234");
    }
    amplitudeService.track("autofill_demo_clicked", { form: "login", test_user });
  };`;

code = code.replace(oldAutofill, newAutofill);

const oldAutofillButton = `<div className="mb-4">
              <button
                type="button"
                onClick={handleAutofill}
                className="w-full py-2.5 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                ⚡ Rellenar datos de prueba
              </button>
            </div>`;

const newAutofillButton = `<div className="mb-4">
              <span className="font-mono text-[10px] uppercase text-brand-dark/50 block mb-2">Accesos Rápidos de Prueba:</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill("camila")}
                  className="w-full py-2 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-lg font-bold flex items-center justify-between px-3 transition-all"
                >
                  <span>🙋‍♀️ Camila</span>
                  <span className="opacity-50">Socia activa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("jorge")}
                  className="w-full py-2 bg-[#A4F1FB]/20 hover:bg-[#A4F1FB]/40 border border-[#A4F1FB]/50 text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-lg font-bold flex items-center justify-between px-3 transition-all"
                >
                  <span>👴 Jorge</span>
                  <span className="opacity-50">Pensionado</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("rosa")}
                  className="w-full py-2 bg-[#FC7E7F]/10 hover:bg-[#FC7E7F]/20 border border-[#FC7E7F]/30 text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-lg font-bold flex items-center justify-between px-3 transition-all"
                >
                  <span>👩 Rosa</span>
                  <span className="opacity-50">Socia nueva</span>
                </button>
              </div>
            </div>`;

code = code.replace(oldAutofillButton, newAutofillButton);

fs.writeFileSync('src/components/LoginModal.tsx', code);
