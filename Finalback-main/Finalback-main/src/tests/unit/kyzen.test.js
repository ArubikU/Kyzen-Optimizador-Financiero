import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { isValidEmail, isValidPassword, validateTransactionInput, validateVoucher, MAX_VOUCHER_BYTES } from '../../utils/validators.js';
import { evaluateBudgetAlert, sumMonthlyExpenses, ALERT_THRESHOLD } from '../../utils/alertEngine.js';
import { convertAmount, monthlyQuota, toGoalView, PEN_PER_USD } from '../../utils/currency.js';
import { transactionsToCsv, filterByPeriod } from '../../utils/csvExport.js';
import { saveVoucher, UPLOADS_DIR } from '../../utils/voucherStorage.js';

describe('HU-07 registro: validación de credenciales', () => {
  test('acepta correo válido y rechaza formatos inválidos', () => {
    assert.equal(isValidEmail('20201234@aloe.ulima.edu.pe'), true);
    assert.equal(isValidEmail('sin-arroba.com'), false);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail(null), false);
  });

  test('contraseña alfanumérica de mínimo 8 caracteres', () => {
    assert.equal(isValidPassword('Kyzen2026'), true);
    assert.equal(isValidPassword('corta1'), false);
    assert.equal(isValidPassword('soloLetrasAqui'), false);
    assert.equal(isValidPassword('12345678'), false);
  });
});

describe('HU-01 transacciones: validación', () => {
  test('rechaza monto 0, negativo o no numérico', () => {
    assert.equal(validateTransactionInput({ type: 'Ingreso', amount: 0 }).length, 1);
    assert.equal(validateTransactionInput({ type: 'Ingreso', amount: -5 }).length, 1);
    assert.equal(validateTransactionInput({ type: 'Ingreso', amount: 'abc' }).length, 1);
  });

  test('la categoría es obligatoria solo en gastos', () => {
    assert.equal(validateTransactionInput({ type: 'Gasto', amount: 10, category: '' }).length, 1);
    assert.equal(validateTransactionInput({ type: 'Gasto', amount: 10, category: 'Comida' }).length, 0);
    assert.equal(validateTransactionInput({ type: 'Ingreso', amount: 10 }).length, 0);
  });
});

describe('HU-20 motor de alertas por umbral (caja blanca)', () => {
  test('sin presupuesto no hay alerta', () => {
    assert.equal(evaluateBudgetAlert(500, null).triggered, false);
    assert.equal(evaluateBudgetAlert(500, 0).level, 'none');
  });

  test('exactamente el 80% NO dispara; por encima sí (rojo)', () => {
    assert.equal(ALERT_THRESHOLD, 0.8);
    assert.equal(evaluateBudgetAlert(800, 1000).triggered, false);
    const over = evaluateBudgetAlert(801, 1000);
    assert.equal(over.triggered, true);
    assert.equal(over.level, 'red');
    assert.match(over.message, /80%|%/);
  });

  test('superar el 100% también alerta', () => {
    const r = evaluateBudgetAlert(1500, 1000);
    assert.equal(r.triggered, true);
    assert.equal(r.percentage, 150);
  });

  test('suma solo los gastos del mes actual', () => {
    const now = new Date('2026-06-17T10:00:00');
    const txs = [
      { type: 'gasto', amount: 100, date: '2026-06-02T10:00:00' },
      { type: 'gasto', amount: 50, date: '2026-06-10T10:00:00' },
      { type: 'gasto', amount: 999, date: '2026-05-30T10:00:00' },
      { type: 'ingreso', amount: 2000, date: '2026-06-05T10:00:00' }
    ];
    assert.equal(sumMonthlyExpenses(txs, now), 150);
  });
});

describe('Metas de ahorro: divisa y cuota mensual', () => {
  test('conversión PEN→USD con el tipo de cambio configurado', () => {
    assert.equal(convertAmount(375, 'USD'), 100);
    assert.equal(convertAmount(375, 'PEN'), 375);
    assert.equal(PEN_PER_USD, 3.75);
  });

  test('cuota mensual = faltante / meses restantes (mínimo 1)', () => {
    const now = new Date('2026-06-17T00:00:00');
    assert.equal(monthlyQuota(2500, 1300, '2026-12-31', now), 200);
    assert.equal(monthlyQuota(2500, 2500, '2026-12-31', now), 0);
    assert.equal(monthlyQuota(1000, 0, '2026-06-30', now), 1000);
  });

  test('toGoalView recalcula montos y progreso en USD', () => {
    const now = new Date('2026-06-17T00:00:00');
    const view = toGoalView({ targetAmount: 3750, currentAmount: 1875, deadline: '2026-12-31' }, 'USD', now);
    assert.equal(view.targetAmount, 1000);
    assert.equal(view.currentAmount, 500);
    assert.equal(view.progress, 50);
    assert.equal(view.currency, 'USD');
  });
});

describe('HU-03 comprobante: JPG/PNG y máximo 5MB', () => {
  const tmpCleanup = [];
  after(() => tmpCleanup.forEach((f) => fs.rmSync(f, { force: true })));

  test('validateVoucher aplica tipo y tamaño', () => {
    assert.equal(validateVoucher({ mimeType: 'image/png', sizeBytes: 1024 }).length, 0);
    assert.equal(validateVoucher({ mimeType: 'application/pdf', sizeBytes: 1024 }).length, 1);
    assert.equal(validateVoucher({ mimeType: 'image/jpeg', sizeBytes: MAX_VOUCHER_BYTES + 1 }).length, 1);
    assert.equal(validateVoucher({ mimeType: 'image/jpeg', sizeBytes: 0 }).length, 1);
  });

  test('saveVoucher guarda el archivo válido y rechaza el inválido', () => {
    const png = Buffer.from('iVBORw0KGgo=', 'base64').toString('base64');
    const { url } = saveVoucher({ mimeType: 'image/png', data: `data:image/png;base64,${png}` });
    const file = path.join(UPLOADS_DIR, path.basename(url));
    tmpCleanup.push(file);
    assert.ok(fs.existsSync(file));
    assert.throws(() => saveVoucher({ mimeType: 'text/plain', data: 'aGVsbG8=' }), /JPG o PNG/);
  });
});

describe('Exportación CSV', () => {
  const txs = [
    { id: 1, date: '2026-06-10T10:00:00Z', type: 'gasto', category: 'Comida', description: 'Almuerzo, menú', amount: 15 },
    { id: 2, date: '2026-05-01T10:00:00Z', type: 'ingreso', category: 'Otros', description: '=SUMA(1+1)', amount: 500 }
  ];

  test('escapa comas y neutraliza fórmulas', () => {
    const csv = transactionsToCsv(txs);
    assert.match(csv, /"Almuerzo, menú"/);
    assert.match(csv, /'=SUMA/);
    assert.equal(csv.split('\n').length, 3);
  });

  test('filtra por periodo mensual', () => {
    const now = new Date('2026-06-17T10:00:00Z');
    assert.equal(filterByPeriod(txs, 'Mensual', now).length, 1);
    assert.equal(filterByPeriod(txs, 'Anual', now).length, 2);
  });
});
