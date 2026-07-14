import React, { useState, useEffect } from "react";
import { amplitudeService } from "../services/amplitude.service";
import { useAuth } from "../hooks/useAuth";
import { normalizeRut, validateRut, formatRut } from "../utils/rut";
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { generateFakeData } from "../utils/demoHelper";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { login, register } = useAuth();
  const [step, setStep] = useState<"login" | "recover" | "register">("login");
  
  // Login fields
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Recovery/Register steps
  const [recoveryRut, setRecoveryRut] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoverySMS, setRecoverySMS] = useState("");
  const [recoveryNewPass, setRecoveryNewPass] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);

  // Register steps
  const [registerRut, setRegisterRut] = useState("");
  const [registerSerial, setRegisterSerial] = useState("");
  const [registerSMS, setRegisterSMS] = useState("");
  const [registerNewPass, setRegisterNewPass] = useState("");
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (isOpen) {
      setStep("login");
      setError("");
      setRut("");
      setPassword("");
      setRecoveryStep(1);
      setRegisterStep(1);
      amplitudeService.track("login_abierto");
    }
  }, [isOpen]);

  const handleAutofill = (test_user: "camila" | "jorge" | "rosa") => {
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
  };

  if (!isOpen) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatRut(e.target.value));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rut) {
      setError("El RUT es obligatorio.");
      amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "rut_invalido" });
      return;
    }

    if (!validateRut(rut)) {
      setError("El RUT ingresado no es válido.");
      amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "rut_invalido" });
      return;
    }

    if (!password) {
      setError("La clave es obligatoria.");
      amplitudeService.track("login_failed", { authentication_method: "rut_password_demo", motivo: "clave_incorrecta" });
      return;
    }

    setLoading(true);

    try {
      await login(rut, password);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "RUT o clave de Internet inválida.");
    } finally {
      setLoading(false);
    }
  };

  // Recovery Flow
  const handleRecoveryNext = () => {
    if (recoveryStep === 1) {
      if (!recoveryRut || !recoveryPhone) {
        setError("Todos los campos son obligatorios.");
        return;
      }
      amplitudeService.track("recuperar_clave_paso_completado", { paso: 1 });
      setRecoveryStep(2);
      setError("");
    } else if (recoveryStep === 2) {
      if (recoverySMS !== "123456" && recoverySMS !== "1234") {
        setError("Código SMS incorrecto. Ingresa 123456.");
        return;
      }
      amplitudeService.track("recuperar_clave_paso_completado", { paso: 2 });
      setRecoveryStep(3);
      setError("");
    } else if (recoveryStep === 3) {
      if (recoveryNewPass.length > 8 || recoveryNewPass.length < 4) {
        setError("La clave debe tener entre 4 y 8 caracteres.");
        return;
      }
      // Demo: registrar nueva contraseña en nuestro auth mock (si corresponde)
      amplitudeService.track("recuperar_clave_completado");
      setStep("login");
      setRut(recoveryRut);
      setPassword(recoveryNewPass);
      setError("");
      alert("¡Clave cambiada con éxito! Ya puedes iniciar sesión.");
    }
  };

  // Registration Flow
  const handleRegisterNext = async () => {
    if (registerStep === 1) {
      if (!registerRut || !registerSerial) {
        setError("El RUT y número de serie son obligatorios.");
        return;
      }
      if (!validateRut(registerRut)) {
        setError("El RUT ingresado no es válido.");
        return;
      }
      amplitudeService.track("crear_clave_paso_completado", { paso: 1 });
      setRegisterStep(2);
      setError("");
    } else if (registerStep === 2) {
      if (registerSMS !== "123456" && registerSMS !== "1234") {
        setError("Código SMS incorrecto. Ingresa 123456.");
        return;
      }
      amplitudeService.track("crear_clave_paso_completado", { paso: 2 });
      setRegisterStep(3);
      setError("");
    } else if (registerStep === 3) {
      if (registerNewPass.length > 8 || registerNewPass.length < 4) {
        setError("La clave debe tener entre 4 y 8 caracteres.");
        return;
      }

      setLoading(true);
      try {
        const fakeData = generateFakeData();
        await register(registerRut, registerNewPass, fakeData.name, fakeData.lastName1, {
          region: fakeData.regionName,
          comuna: fakeData.comunaName,
          es_socio: true
        });

        amplitudeService.track("crear_clave_completado");
        setStep("login");
        setRut(registerRut);
        setPassword(registerNewPass);
        setError("");
        alert("¡Clave creada con éxito! Ya puedes ingresar.");
      } catch (err: any) {
        setError(err.message || "Error al crear tu cuenta de acceso.");
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-[#F2F2F2] border border-brand-dark/20 text-[#1C1F24] p-6 md:p-8 flex flex-col relative"
        style={{ borderRadius: "18px" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-brand-dark/5 rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {step === "login" && (
          <div>
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-brand-dark/60 block mb-1">
                00 — Acceso Seguro
              </span>
              <h2 className="font-display text-2xl tracking-tight text-brand-dark">
                MindersCredit en Línea
              </h2>
              <p className="text-xs text-brand-dark/70 mt-1">
                Ingresa tus credenciales para acceder a tu sitio privado.
              </p>
            </div>

            <div className="mb-4">
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
            </div>

            {error && (
              <div className="mb-4 p-3 bg-accent-coral/20 border border-accent-coral/30 rounded-lg flex items-start gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                  RUT de Usuario
                </label>
                <input data-amp-mask
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark transition-colors font-mono"
                  data-amp-event="input_rut_login"
                  
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80">
                    Clave de Internet
                  </label>
                  <span className="text-[10px] font-mono text-brand-dark/50">
                    {password.length}/8 caracteres
                  </span>
                </div>
                <div className="relative">
                  <input data-amp-mask
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    maxLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                    className="w-full p-3 pr-10 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark transition-colors font-mono"
                    
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-dark text-white font-mono text-sm uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all flex items-center justify-center gap-2"
                  data-amp-event="btn_login_submit"
                  data-amp-props={JSON.stringify({ rut })}
                >
                  {loading ? "Iniciando Sesión..." : "Ingresar a mi cuenta"}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-brand-dark/10 flex flex-col sm:flex-row justify-between text-xs font-mono gap-3">
              <button
                onClick={() => { setStep("recover"); setError(""); }}
                className="text-left text-brand-dark/70 hover:text-brand-dark hover:underline"
              >
                ¿Olvidaste tu clave?
              </button>
              <button
                onClick={() => { setStep("register"); setError(""); }}
                className="text-left text-brand-dark/70 hover:text-brand-dark hover:underline"
              >
                Crear clave internet
              </button>
            </div>

            <div className="mt-6 p-4 bg-brand-dark/5 rounded-xl border border-brand-dark/5 text-[11px] text-brand-dark/70 space-y-2">
              <div className="flex items-center gap-1.5 font-mono font-bold text-brand-dark">
                <Lock className="w-3.5 h-3.5 text-brand-dark" />
                CONSEJOS DE SEGURIDAD
              </div>
              <p>• MindersCredit nunca te solicitará tus claves, códigos de SMS o número de serie por teléfono o correo.</p>
              <p>• Valida siempre que la barra del navegador contenga un candado cerrado y comience con https.</p>
            </div>
          </div>
        )}

        {step === "recover" && (
          <div>
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-brand-dark/60 block mb-1">
                Recuperación — Paso {recoveryStep} de 3
              </span>
              <h2 className="font-display text-2xl tracking-tight text-brand-dark">
                Recupera tu Clave
              </h2>
              <p className="text-xs text-brand-dark/70 mt-1">
                Sigue las instrucciones para reestablecer tu clave de acceso.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-accent-coral/20 border border-accent-coral/30 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {recoveryStep === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                      RUT de Socio
                    </label>
                    <input data-amp-mask
                      type="text"
                      placeholder="12.345.678-9"
                      value={recoveryRut}
                      onChange={(e) => setRecoveryRut(formatRut(e.target.value))}
                      className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                      Celular Registrado (+56)
                    </label>
                    <div className="flex">
                      <span className="bg-brand-dark/5 border border-r-0 border-brand-dark/20 p-3 text-sm font-mono text-brand-dark/70 rounded-l-lg select-none">
                        +56
                      </span>
                      <input data-amp-mask
                        type="tel"
                        placeholder="9 1234 5678"
                        maxLength={9}
                        value={recoveryPhone}
                        onChange={(e) => setRecoveryPhone(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full p-3 border border-brand-dark/20 rounded-r-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {recoveryStep === 2 && (
                <div>
                  <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                    Código de Validación SMS
                  </label>
                  <input data-amp-mask
                    type="text"
                    maxLength={6}
                    placeholder="Ingresa 123456"
                    value={recoverySMS}
                    onChange={(e) => setRecoverySMS(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white text-center tracking-widest focus:outline-none focus:border-brand-dark font-mono text-lg"
                  />
                  <p className="text-[11px] text-brand-dark/60 mt-1 font-mono text-center">
                    Hemos enviado un código de 6 dígitos a tu celular +56 {recoveryPhone.slice(-4).padStart(9, "*")}
                  </p>
                </div>
              )}

              {recoveryStep === 3 && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80">
                      Nueva Clave de Internet (4-8 digitos)
                    </label>
                    <span className="text-[10px] font-mono text-brand-dark/50">
                      {recoveryNewPass.length}/8
                    </span>
                  </div>
                  <input data-amp-mask
                    type="password"
                    maxLength={8}
                    placeholder="Nueva clave numérica"
                    value={recoveryNewPass}
                    onChange={(e) => setRecoveryNewPass(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono text-center text-lg tracking-widest"
                  />
                </div>
              )}

              <button
                onClick={handleRecoveryNext}
                className="w-full py-3 bg-brand-dark text-white font-mono text-sm uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all"
              >
                {recoveryStep === 3 ? "Guardar Nueva Clave" : "Siguiente Paso"}
              </button>

              <button
                onClick={() => { setStep("login"); setError(""); }}
                className="w-full text-center text-xs font-mono text-brand-dark/60 hover:text-brand-dark hover:underline block pt-2"
              >
                Volver al Acceso
              </button>
            </div>
          </div>
        )}

        {step === "register" && (
          <div>
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-brand-dark/60 block mb-1">
                Creación de Clave — Paso {registerStep} de 3
              </span>
              <h2 className="font-display text-2xl tracking-tight text-brand-dark">
                Crea tu Clave Digital
              </h2>
              <p className="text-xs text-brand-dark/70 mt-1">
                Crea tu clave de acceso para operar en MindersCredit en Línea.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-accent-coral/20 border border-accent-coral/30 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {registerStep === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                      RUT del Socio
                    </label>
                    <input data-amp-mask
                      type="text"
                      placeholder="12.345.678-9"
                      value={registerRut}
                      onChange={(e) => setRegisterRut(formatRut(e.target.value))}
                      className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                      Número de Serie de Cédula
                    </label>
                    <input data-amp-mask
                      type="text"
                      maxLength={11}
                      placeholder="Ej. A112233445"
                      value={registerSerial}
                      onChange={(e) => setRegisterSerial(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                      className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono"
                    />
                  </div>
                </>
              )}

              {registerStep === 2 && (
                <div>
                  <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-brand-dark/80">
                    Ingresar Código SMS
                  </label>
                  <input data-amp-mask
                    type="text"
                    maxLength={6}
                    placeholder="Ingresa 123456"
                    value={registerSMS}
                    onChange={(e) => setRegisterSMS(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white text-center tracking-widest focus:outline-none focus:border-brand-dark font-mono text-lg"
                  />
                  <p className="text-[11px] text-brand-dark/60 mt-1 font-mono text-center">
                    Hemos enviado un código SMS para comprobar tu identidad.
                  </p>
                </div>
              )}

              {registerStep === 3 && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80">
                      Define tu Clave Numérica (4-8 digitos)
                    </label>
                    <span className="text-[10px] font-mono text-brand-dark/50">
                      {registerNewPass.length}/8
                    </span>
                  </div>
                  <input data-amp-mask
                    type="password"
                    maxLength={8}
                    placeholder="Crea tu clave secreta"
                    value={registerNewPass}
                    onChange={(e) => setRegisterNewPass(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-dark font-mono text-center text-lg tracking-widest"
                  />
                </div>
              )}

              <button
                onClick={handleRegisterNext}
                className="w-full py-3 bg-brand-dark text-white font-mono text-sm uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all"
              >
                {registerStep === 3 ? "Crear Nueva Clave" : "Siguiente Paso"}
              </button>

              <button
                onClick={() => { setStep("login"); setError(""); }}
                className="w-full text-center text-xs font-mono text-brand-dark/60 hover:text-brand-dark hover:underline block pt-2"
              >
                Volver al Acceso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
