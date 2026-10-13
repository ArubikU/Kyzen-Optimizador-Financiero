import Transaction from '../Models/Transactions.js';
import Category from '../Models/Categories.js';
import { validateTransactionInput } from '../utils/validators.js';
import { saveVoucher } from '../utils/voucherStorage.js';
import { transactionsToCsv, filterByPeriod } from '../utils/csvExport.js';

const toView = (t) => ({
  id: t.id,
  type: t.type,
  amount: t.amount,
  description: t.description,
  date: t.date,
  userId: t.userId,
  voucherUrl: t.voucherUrl,
  category: t.category ? t.category.name : 'Otros'
});

export const createTransaction = async (req, res) => {
  const { type, amount, description, date, category, voucher } = req.body;
  const userId = req.user ? req.user.id : 1;

  // HU-01: monto > 0 y categoría obligatoria en gastos
  const errors = validateTransactionInput({ type, amount, category });
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(' '), errors });

  try {
    // HU-03: comprobante opcional (JPG/PNG, máx. 5MB) enviado como { mimeType, data } en base64
    let voucherUrl = null;
    if (voucher) {
      try {
        voucherUrl = saveVoucher(voucher).url;
      } catch (voucherError) {
        return res.status(400).json({ success: false, message: voucherError.message });
      }
    }

    const dbCategory = await Category.findOne({ where: { name: category || 'Otros' } });
    const categoryId = dbCategory ? dbCategory.id : null;

    const newTransaction = await Transaction.create({
      type: String(type).toLowerCase() === 'gasto' ? 'gasto' : 'ingreso',
      amount: parseFloat(amount),
      description: description || 'Transacción sin concepto',
      date: date || new Date(),
      userId,
      categoryId,
      voucherUrl
    });

    res.status(201).json({
      success: true,
      message: 'Transacción guardada exitosamente.',
      data: {
        ...newTransaction.toJSON(),
        category: category || 'Otros' // Devolvemos el nombre de la categoría para compatibilidad
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchUserTransactions = async (userId, { category, type }) => {
  const where = { userId };
  if (type) where.type = type.toLowerCase();
  const rows = await Transaction.findAll({
    where,
    include: [{ model: Category, as: 'category' }],
    order: [['date', 'DESC']]
  });
  const mapped = rows.map(toView);
  return category ? mapped.filter((t) => t.category === category) : mapped;
};

export const getTransactions = async (req, res) => {
  try {
    res.json(await fetchUserTransactions(req.user ? req.user.id : 1, req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exportación de datos financieros: GET /api/transactions/export?period=Mensual|Semanal|Anual
export const exportTransactions = async (req, res) => {
  try {
    const all = await fetchUserTransactions(req.user.id, req.query);
    const selected = filterByPeriod(all, req.query.period || 'Mensual');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kyzen-transacciones.csv"');
    res.send('﻿' + transactionsToCsv(selected));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
