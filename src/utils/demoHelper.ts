import { CHILEAN_REGIONS } from "../data";

export interface FakeData {
  name: string;
  lastName1: string;
  lastName2: string;
  fullName: string;
  email: string;
  phone: string;
  rut: string;
  regionId: string;
  regionName: string;
  comunaId: string;
  comunaName: string;
  serial: string;
}

const CHILEAN_NAMES = [
  "Sebastián", "Camila", "Jorge", "Rosa", "Matías", "Ignacio", "Sofía", "Valentina", "Nicolás", "Andrés",
  "Francisca", "Diego", "Javiera", "Tomás", "Fernanda", "Gabriel", "Constanza", "Felipe", "Antonia", "Bastián",
  "Catalina", "Vicente", "Isidora"
];

const CHILEAN_SURNAMES = [
  "Allende", "Fuentes", "Sepúlveda", "Rojas", "González", "Muñoz", "Díaz", "Vásquez", "Araya", "Pérez",
  "Castillo", "Silva", "Soto", "Contreras", "Martínez", "Lara", "Salinas", "Herrera", "Gómez", "Flores",
  "Toro", "Henríquez"
];

export function calculateRutDV(rutBody: number): string {
  let sum = 0;
  let mul = 2;
  const bodyStr = rutBody.toString();
  for (let i = bodyStr.length - 1; i >= 0; i--) {
    sum += parseInt(bodyStr.charAt(i), 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const dvr = 11 - (sum % 11);
  if (dvr === 11) return "0";
  if (dvr === 10) return "K";
  return dvr.toString();
}

export function generateRandomRut(): string {
  const body = Math.floor(11000000 + Math.random() * 14000000);
  const dv = calculateRutDV(body);
  const bodyStr = body.toString();
  const part1 = bodyStr.slice(0, -6);
  const part2 = bodyStr.slice(-6, -3);
  const part3 = bodyStr.slice(-3);
  return `${part1}.${part2}.${part3}-${dv}`;
}

export function generateFakeData(): FakeData {
  const name = CHILEAN_NAMES[Math.floor(Math.random() * CHILEAN_NAMES.length)];
  const lastName1 = CHILEAN_SURNAMES[Math.floor(Math.random() * CHILEAN_SURNAMES.length)];
  const lastName2 = CHILEAN_SURNAMES[Math.floor(Math.random() * CHILEAN_SURNAMES.length)];
  const fullName = `${name} ${lastName1} ${lastName2}`;
  
  const email = `${name.toLowerCase()}.${lastName1.toLowerCase()}@example.com`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
    
  // phone is e.g. 912345678 (8 digits after 9)
  const phoneVal = Math.floor(10000000 + Math.random() * 89999999).toString();
  const phone = "9" + phoneVal;
  
  const rut = generateRandomRut();
  const regObj = CHILEAN_REGIONS[Math.floor(Math.random() * CHILEAN_REGIONS.length)];
  const comObj = regObj.comunas[Math.floor(Math.random() * regObj.comunas.length)];
  
  // Serial number (9 chars)
  const serial = Math.floor(100000000 + Math.random() * 899999999).toString();
  
  return {
    name,
    lastName1,
    lastName2,
    fullName,
    email,
    phone,
    rut,
    regionId: regObj.id,
    regionName: regObj.name,
    comunaId: comObj.id,
    comunaName: comObj.name,
    serial,
  };
}
