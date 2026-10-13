// Prueba de integración de extremo a extremo contra el backend y PostgreSQL reales.
// Requiere: backend en http://localhost:4000, base sembrada (node seed.js) y ALLOW_DEV_OTP=true.
// Uso: node src/tests/e2e/api.e2e.mjs
import assert from 'node:assert/strict';

const BASE = process.env.API_URL || 'http://localhost:4000/api';
const email = `e2e_${Date.now()}@aloe.ulima.edu.pe`;
let token;
let passed = 0;

const call = async (method, path, body, auth = true) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth && token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, body: type.includes('json') ? await res.json() : await res.text() };
};
const step = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

console.log('HU-07 / HU-08 autenticación');
await step('rechaza correo inválido', async () => {
  const r = await call('POST', '/auth/register', { email: 'malo', password: 'Kyzen2026' }, false);
  assert.equal(r.status, 400);
});
await step('rechaza contraseña débil', async () => {
  const r = await call('POST', '/auth/register', { email, password: 'corta' }, false);
  assert.equal(r.status, 400);
});
await step('registra, verifica OTP y obtiene token', async () => {
  const reg = await call('POST', '/auth/register', { firstName: 'E2E', lastName: 'Test', birthDate: '2000-01-01', email, password: 'Kyzen2026' }, false);
  assert.equal(reg.status, 201);
  const otp = await call('POST', '/auth/verify-otp', { email, code: '123456' }, false);
  assert.equal(otp.status, 200, 'requiere ALLOW_DEV_OTP=true');
  token = otp.body.token;
  assert.ok(token);
});
await step('login inválido devuelve mensaje genérico', async () => {
  const r = await call('POST', '/auth/login', { email, password: 'Incorrecta1' }, false);
  assert.equal(r.status, 401);
  assert.equal(r.body.message, 'Credenciales inválidas.');
});
await step('login válido', async () => {
  const r = await call('POST', '/auth/login', { email, password: 'Kyzen2026' }, false);
  assert.equal(r.status, 200);
});
await step('rutas protegidas rechazan sin token', async () => {
  assert.equal((await call('GET', '/transactions', null, false)).status, 401);
});

console.log('HU-01 / HU-03 transacciones');
await step('rechaza monto 0', async () => {
  assert.equal((await call('POST', '/transactions', { type: 'Ingreso', amount: 0, description: 'x' })).status, 400);
});
await step('rechaza gasto sin categoría', async () => {
  assert.equal((await call('POST', '/transactions', { type: 'Gasto', amount: 10, description: 'x' })).status, 400);
});
await step('registra ingreso', async () => {
  const r = await call('POST', '/transactions', { type: 'Ingreso', amount: 1000, description: 'Beca', category: 'Otros Ingresos' });
  assert.equal(r.status, 201);
});
await step('registra gasto con comprobante PNG', async () => {
  const r = await call('POST', '/transactions', { type: 'Gasto', amount: 100, description: 'Almuerzo', category: 'Comida', voucher: { mimeType: 'image/png', data: PNG } });
  assert.equal(r.status, 201);
  assert.match(r.body.data.voucherUrl, /^\/uploads\/.+\.png$/);
  const img = await fetch(`http://localhost:4000${r.body.data.voucherUrl}`);
  assert.equal(img.status, 200);
});
await step('rechaza comprobante PDF', async () => {
  const r = await call('POST', '/transactions', { type: 'Gasto', amount: 5, description: 'x', category: 'Hogar', voucher: { mimeType: 'application/pdf', data: 'aGk=' } });
  assert.equal(r.status, 400);
});
await step('lista transacciones con categoría', async () => {
  const r = await call('GET', '/transactions');
  assert.equal(r.body.length, 2);
  assert.ok(r.body.some((t) => t.category === 'Comida'));
});

console.log('HU-12 / HU-20 dashboard y alertas');
await step('sin presupuesto no hay alerta', async () => {
  const r = await call('GET', '/dashboard/summary');
  assert.equal(r.body.totals.balance, 900);
  assert.equal(r.body.charts.byCategory.Comida, 100);
  assert.equal(r.body.alertBanner, null);
});
await step('presupuesto inválido es rechazado', async () => {
  assert.equal((await call('PUT', '/auth/budget', { monthlyBudget: -1 })).status, 400);
});
await step('gasto 100 de presupuesto 120 (83%) dispara alerta roja', async () => {
  assert.equal((await call('PUT', '/auth/budget', { monthlyBudget: 120 })).status, 200);
  const r = await call('GET', '/dashboard/summary');
  assert.equal(r.body.budget.level, 'red');
  assert.match(r.body.alertBanner, /83%/);
});
await step('presupuesto 1000 (10%) no alerta', async () => {
  await call('PUT', '/auth/budget', { monthlyBudget: 1000 });
  assert.equal((await call('GET', '/dashboard/summary')).body.alertBanner, null);
});

console.log('Metas de ahorro');
let goalId;
await step('crea meta', async () => {
  const r = await call('POST', '/goals', { name: 'Laptop', targetAmount: 3750, currentAmount: 375, deadline: '2030-12-31', categoryIcon: '💻' });
  assert.equal(r.status, 201);
  goalId = r.body.data.id;
});
await step('rechaza meta inválida', async () => {
  assert.equal((await call('POST', '/goals', { name: 'x', targetAmount: 0, deadline: '2030-01-01' })).status, 400);
});
await step('recalcula en USD', async () => {
  const r = await call('GET', '/goals?currency=USD');
  assert.equal(r.body[0].targetAmount, 1000);
  assert.equal(r.body[0].currentAmount, 100);
  assert.equal(r.body[0].currency, 'USD');
});
await step('actualiza y elimina', async () => {
  const u = await call('PUT', `/goals/${goalId}`, { currentAmount: 1875 });
  assert.equal(u.body.data.progress, 50);
  assert.equal((await call('DELETE', `/goals/${goalId}`)).status, 200);
  assert.equal((await call('DELETE', `/goals/${goalId}`)).status, 404);
});

console.log('Exportación y perfil');
await step('exporta CSV', async () => {
  const r = await call('GET', '/transactions/export?period=Anual');
  assert.equal(r.status, 200);
  assert.match(r.body, /id,fecha,tipo,categoria,descripcion,monto/);
  assert.match(r.body, /Almuerzo/);
});
await step('perfil devuelve presupuesto', async () => {
  const r = await call('GET', '/auth/profile');
  assert.equal(r.body.monthlyBudget, 1000);
});
await step('cambia contraseña', async () => {
  assert.equal((await call('PUT', '/auth/change-password', { currentPassword: 'mala', newPassword: 'Nueva2026' })).status, 401);
  assert.equal((await call('PUT', '/auth/change-password', { currentPassword: 'Kyzen2026', newPassword: 'debil' })).status, 400);
  assert.equal((await call('PUT', '/auth/change-password', { currentPassword: 'Kyzen2026', newPassword: 'Nueva2026' })).status, 200);
  assert.equal((await call('POST', '/auth/login', { email, password: 'Nueva2026' }, false)).status, 200);
});

console.log(`\n${passed} verificaciones E2E superadas.`);
