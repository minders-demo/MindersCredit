const fs = require('fs');
let code = fs.readFileSync('src/services/auth.service.ts', 'utf-8');

// 1. Remove platform legacy from login_started
code = code.replace(
  `    amplitudeService.track("login_started", {
      authentication_method: "rut_password_demo",
      platform: amplitudeService.getPlatform(),
    });`,
  `    amplitudeService.track("login_started", {
      authentication_method: "rut_password_demo"
    });`
);

// 2. Change error_message to motivo
code = code.replace(
  `        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          error_message: "wrong_password",
        });`,
  `        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          motivo: "clave_incorrecta",
        });`
);

code = code.replace(
  `        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          error_message: "wrong_password",
        });`,
  `        amplitudeService.track("login_failed", {
          authentication_method: "rut_password_demo",
          motivo: "clave_incorrecta",
        });`
);

// Add login_succeeded { customer_segment }
code = code.replace(
  `    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
    });`,
  `    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
      customer_segment: sessionObj.customer_segment,
    });`
);

code = code.replace(
  `    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
      registration: true,
    });`,
  `    amplitudeService.track("login_succeeded", {
      authentication_method: "rut_password_demo",
      customer_segment: sessionObj.customer_segment,
      registration: true,
    });`
);

// Guest es_socio: false
code = code.replace(
  `      es_socio: true,
      pensionada: additionalProps.pensionada ?? false,`,
  `      es_socio: false,
      pensionada: additionalProps.pensionada ?? false,`
);

// Identify add region
code = code.replace(
  `    amplitudeService.identifyUser({
      customer_segment: sessionObj.customer_segment,
      es_socio: userProfile.es_socio,
      platform: amplitudeService.getPlatform(),
    });`,
  `    const identifyPayload: any = {
      customer_segment: sessionObj.customer_segment,
      es_socio: userProfile.es_socio,
      platform: amplitudeService.getPlatform(),
    };
    if (demoUser && demoUser.region) {
      identifyPayload.region = demoUser.region;
    }
    amplitudeService.identifyUser(identifyPayload);`
);

fs.writeFileSync('src/services/auth.service.ts', code);
