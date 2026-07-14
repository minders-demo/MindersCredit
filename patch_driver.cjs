const fs = require('fs');
let code = fs.readFileSync('src/services/amplitude.service.ts', 'utf-8');

// Remove the fake import
code = code.replace('import { driverService } from "./driver.service";', '');

// Add driverService
const driverServiceCode = `
export const driverService = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("amp_driver_" + key);
  },
  set(key: string, value: any): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("amp_driver_" + key, String(value));
  },
  getAll(): Record<string, any> {
    if (typeof window === "undefined") return {};
    const res: Record<string, any> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("amp_driver_")) {
        const val = sessionStorage.getItem(k);
        let parsedVal: any = val;
        if (val === "true") parsedVal = true;
        if (val === "false") parsedVal = false;
        if (val && !isNaN(Number(val))) parsedVal = Number(val);
        res[k.replace("amp_driver_", "")] = parsedVal;
      }
    }
    return res;
  }
};
`;

code = code.replace('export const amplitudeService', driverServiceCode + '\nexport const amplitudeService');

fs.writeFileSync('src/services/amplitude.service.ts', code);
