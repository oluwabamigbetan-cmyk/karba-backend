import fs from 'fs';
const FILE = './data/leads.json';

export function fileStorageInit() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf-8');
}

export function fileStorageAdd(lead) {
  const arr = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  arr.push(lead);
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
}
