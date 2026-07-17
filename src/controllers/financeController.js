const mongoose = require('mongoose');
const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');
const asyncHandler = require('../middleware/asyncHandler');

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Default chart of accounts, seeded on demand. Codes follow the usual
 * ranges: 1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx expense.
 */
const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'Cash', type: 'asset', category: 'cash', isPaymentAccount: true },
  { code: '1010', name: 'Bank Account', type: 'asset', category: 'bank', isPaymentAccount: true },
  { code: '1200', name: 'Accounts Receivable', type: 'asset', category: 'receivable' },
  { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'payable' },
  { code: '2100', name: 'GST Payable', type: 'liability', category: 'tax' },
  { code: '3000', name: "Owner's Capital", type: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity' },
  { code: '4000', name: 'Service Revenue', type: 'income' },
  { code: '4010', name: 'Product Sales', type: 'income' },
  { code: '4900', name: 'Other Income', type: 'income' },
  { code: '5000', name: 'Salaries & Wages', type: 'expense' },
  { code: '5010', name: 'Rent', type: 'expense' },
  { code: '5020', name: 'Software & Subscriptions', type: 'expense' },
  { code: '5030', name: 'Marketing & Advertising', type: 'expense' },
  { code: '5040', name: 'Office Supplies', type: 'expense' },
  { code: '5050', name: 'Travel', type: 'expense' },
  { code: '5060', name: 'Professional Fees', type: 'expense' },
  { code: '5070', name: 'Bank Charges', type: 'expense' },
  { code: '5900', name: 'Miscellaneous Expense', type: 'expense' }
];

/* ------------------------------------------------------------------ */
/*  CHART OF ACCOUNTS                                                   */
/* ------------------------------------------------------------------ */

/**
 * @desc    Seed the default chart of accounts (idempotent)
 * @route   POST /api/v1/finance/accounts/seed
 * @access  Private
 */
exports.seedAccounts = asyncHandler(async (req, res) => {
  const created = [];
  for (const def of DEFAULT_ACCOUNTS) {
    const exists = await Account.findOne({ code: def.code });
    if (exists) continue;
    const account = await Account.create({
      ...def,
      isSystem: true,
      createdBy: req.user ? req.user.id : undefined
    });
    created.push(account);
  }

  const total = await Account.countDocuments();

  res.status(201).json({
    status: 'success',
    message: `Seeded ${created.length} account(s)`,
    data: { created: created.length, total }
  });
});

/**
 * @desc    List accounts
 * @route   GET /api/v1/finance/accounts
 * @access  Private
 */
exports.getAccounts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
  if (req.query.isPaymentAccount) filter.isPaymentAccount = req.query.isPaymentAccount === 'true';

  const accounts = await Account.find(filter).sort('code');

  res.status(200).json({
    status: 'success',
    count: accounts.length,
    data: accounts
  });
});

/**
 * @desc    Create an account
 * @route   POST /api/v1/finance/accounts
 * @access  Private
 */
exports.createAccount = asyncHandler(async (req, res) => {
  const { code, name, type, category, isPaymentAccount, description } = req.body;

  const existing = await Account.findOne({ code: code ? code.trim() : code });
  if (existing) {
    return res.status(400).json({
      status: 'fail',
      message: `An account with code ${code} already exists`
    });
  }

  const account = await Account.create({
    code,
    name,
    type,
    category,
    isPaymentAccount: !!isPaymentAccount,
    description,
    createdBy: req.user ? req.user.id : undefined
  });

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: account
  });
});

/**
 * @desc    Update an account
 * @route   PUT /api/v1/finance/accounts/:id
 * @access  Private
 */
exports.updateAccount = asyncHandler(async (req, res) => {
  delete req.body.createdBy;
  delete req.body.isSystem;
  delete req.body.normalBalance;

  const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!account) {
    return res.status(404).json({ status: 'fail', message: 'Account not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Account updated successfully',
    data: account
  });
});

/**
 * @desc    Delete an account (blocked for system accounts or those in use)
 * @route   DELETE /api/v1/finance/accounts/:id
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ status: 'fail', message: 'Account not found' });
  }
  if (account.isSystem) {
    return res.status(400).json({
      status: 'fail',
      message: 'System accounts cannot be deleted. Deactivate it instead.'
    });
  }

  const inUse = await JournalEntry.countDocuments({ 'lines.account': account._id });
  if (inUse > 0) {
    return res.status(400).json({
      status: 'fail',
      message: `This account is used by ${inUse} transaction(s) and cannot be deleted. Deactivate it instead.`
    });
  }

  await account.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully',
    data: null
  });
});

/* ------------------------------------------------------------------ */
/*  PAYMENTS (simple form -> balanced journal entry)                   */
/* ------------------------------------------------------------------ */

/**
 * @desc    Record a payment received or paid. Creates a balanced double
 *          entry behind the scenes.
 * @route   POST /api/v1/finance/payments
 * @access  Private
 *
 *  Money IN  (received): Debit  payment account (cash/bank),  Credit category
 *  Money OUT (paid):     Credit payment account (cash/bank),  Debit  category
 */
exports.recordPayment = asyncHandler(async (req, res) => {
  const {
    direction,
    amount,
    paymentAccount,
    categoryAccount,
    party,
    partyType,
    date,
    method,
    description,
    reference
  } = req.body;

  const value = round2(amount);
  if (!value || value <= 0) {
    return res.status(400).json({ status: 'fail', message: 'Amount must be greater than zero' });
  }

  const [cashAcc, catAcc] = await Promise.all([
    Account.findById(paymentAccount),
    Account.findById(categoryAccount)
  ]);

  if (!cashAcc) {
    return res.status(400).json({ status: 'fail', message: 'Payment account not found' });
  }
  if (!catAcc) {
    return res.status(400).json({ status: 'fail', message: 'Category account not found' });
  }
  if (cashAcc._id.equals(catAcc._id)) {
    return res.status(400).json({ status: 'fail', message: 'Payment and category accounts must be different' });
  }

  const lineFor = (acc, debit, credit) => ({
    account: acc._id,
    code: acc.code,
    name: acc.name,
    type: acc.type,
    debit,
    credit
  });

  let lines;
  if (direction === 'in') {
    lines = [lineFor(cashAcc, value, 0), lineFor(catAcc, 0, value)];
  } else {
    lines = [lineFor(catAcc, value, 0), lineFor(cashAcc, 0, value)];
  }

  const entry = await JournalEntry.create({
    date: date || Date.now(),
    description,
    reference,
    party: { name: party, type: partyType || 'other' },
    source: 'payment',
    direction,
    method,
    lines,
    createdBy: req.user ? req.user.id : undefined
  });

  res.status(201).json({
    status: 'success',
    message: direction === 'in' ? 'Payment recorded as received' : 'Payment recorded as paid',
    data: entry
  });
});

/* ------------------------------------------------------------------ */
/*  JOURNAL ENTRIES                                                     */
/* ------------------------------------------------------------------ */

/**
 * @desc    List journal entries (transactions)
 * @route   GET /api/v1/finance/entries
 * @access  Private
 */
exports.getEntries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.source) filter.source = req.query.source;
  if (req.query.direction) filter.direction = req.query.direction;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
  }

  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    filter.$or = [{ description: rx }, { 'party.name': rx }, { entryNo: rx }, { reference: rx }];
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const entries = await JournalEntry.find(filter)
    .sort('-date -createdAt')
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email');

  const total = await JournalEntry.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    count: entries.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: entries
  });
});

/**
 * @desc    Get a single journal entry
 * @route   GET /api/v1/finance/entries/:id
 * @access  Private
 */
exports.getEntry = asyncHandler(async (req, res) => {
  const entry = await JournalEntry.findById(req.params.id).populate('createdBy', 'name email');

  if (!entry) {
    return res.status(404).json({ status: 'fail', message: 'Entry not found' });
  }

  res.status(200).json({ status: 'success', data: entry });
});

/**
 * @desc    Create a manual balanced journal entry
 * @route   POST /api/v1/finance/entries
 * @access  Private
 */
exports.createEntry = asyncHandler(async (req, res) => {
  const { date, description, reference, party, lines } = req.body;

  if (!Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ status: 'fail', message: 'At least two lines are required' });
  }

  // Resolve and denormalise each referenced account.
  const resolved = [];
  for (const l of lines) {
    const acc = await Account.findById(l.account);
    if (!acc) {
      return res.status(400).json({ status: 'fail', message: `Account not found for a line` });
    }
    resolved.push({
      account: acc._id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: round2(l.debit),
      credit: round2(l.credit)
    });
  }

  try {
    const entry = await JournalEntry.create({
      date: date || Date.now(),
      description,
      reference,
      party: party || undefined,
      source: 'manual',
      lines: resolved,
      createdBy: req.user ? req.user.id : undefined
    });

    res.status(201).json({
      status: 'success',
      message: 'Journal entry created successfully',
      data: entry
    });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
});

/**
 * @desc    Delete a journal entry
 * @route   DELETE /api/v1/finance/entries/:id
 * @access  Private
 */
exports.deleteEntry = asyncHandler(async (req, res) => {
  const entry = await JournalEntry.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({ status: 'fail', message: 'Entry not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Entry deleted successfully',
    data: null
  });
});

/* ------------------------------------------------------------------ */
/*  REPORTS                                                             */
/* ------------------------------------------------------------------ */

// Aggregate debit/credit totals per account across posted entries.
async function accountTotals(match = {}) {
  return JournalEntry.aggregate([
    { $match: { status: 'posted', ...match } },
    { $unwind: '$lines' },
    {
      $group: {
        _id: '$lines.account',
        debit: { $sum: '$lines.debit' },
        credit: { $sum: '$lines.credit' }
      }
    }
  ]);
}

/**
 * @desc    Trial balance — every account with its debit/credit balance.
 *          Total debits should equal total credits.
 * @route   GET /api/v1/finance/reports/trial-balance
 * @access  Private
 */
exports.getTrialBalance = asyncHandler(async (req, res) => {
  const [accounts, totals] = await Promise.all([
    Account.find().sort('code'),
    accountTotals()
  ]);

  const byId = {};
  totals.forEach((t) => { byId[String(t._id)] = t; });

  let totalDebit = 0;
  let totalCredit = 0;

  const rows = accounts.map((acc) => {
    const t = byId[String(acc._id)] || { debit: 0, credit: 0 };
    const net = round2(t.debit - t.credit); // positive => net debit
    const debitBalance = net > 0 ? net : 0;
    const creditBalance = net < 0 ? round2(-net) : 0;
    totalDebit = round2(totalDebit + debitBalance);
    totalCredit = round2(totalCredit + creditBalance);
    return {
      account: { _id: acc._id, code: acc.code, name: acc.name, type: acc.type },
      debit: debitBalance,
      credit: creditBalance
    };
  }).filter((r) => r.debit !== 0 || r.credit !== 0);

  res.status(200).json({
    status: 'success',
    data: {
      rows,
      totalDebit,
      totalCredit,
      balanced: totalDebit === totalCredit
    }
  });
});

/**
 * @desc    Profit & Loss for a date range (income vs expense).
 * @route   GET /api/v1/finance/reports/pnl
 * @access  Private
 */
exports.getProfitAndLoss = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.startDate || req.query.endDate) {
    match.date = {};
    if (req.query.startDate) match.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) match.date.$lte = new Date(req.query.endDate);
  }

  const [accounts, totals] = await Promise.all([
    Account.find({ type: { $in: ['income', 'expense'] } }).sort('code'),
    accountTotals(match)
  ]);

  const byId = {};
  totals.forEach((t) => { byId[String(t._id)] = t; });

  const income = [];
  const expense = [];
  let totalIncome = 0;
  let totalExpense = 0;

  accounts.forEach((acc) => {
    const t = byId[String(acc._id)] || { debit: 0, credit: 0 };
    if (acc.type === 'income') {
      const amount = round2(t.credit - t.debit); // income increases on credit
      if (amount !== 0) {
        income.push({ account: { code: acc.code, name: acc.name }, amount });
        totalIncome = round2(totalIncome + amount);
      }
    } else {
      const amount = round2(t.debit - t.credit); // expense increases on debit
      if (amount !== 0) {
        expense.push({ account: { code: acc.code, name: acc.name }, amount });
        totalExpense = round2(totalExpense + amount);
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      income,
      expense,
      totalIncome,
      totalExpense,
      netProfit: round2(totalIncome - totalExpense),
      period: { startDate: req.query.startDate || null, endDate: req.query.endDate || null }
    }
  });
});

/**
 * @desc    Ledger for a single account (running balance over time).
 * @route   GET /api/v1/finance/reports/ledger/:accountId
 * @access  Private
 */
exports.getLedger = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.accountId);
  if (!account) {
    return res.status(404).json({ status: 'fail', message: 'Account not found' });
  }

  const match = { status: 'posted', 'lines.account': account._id };
  if (req.query.startDate || req.query.endDate) {
    match.date = {};
    if (req.query.startDate) match.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) match.date.$lte = new Date(req.query.endDate);
  }

  const entries = await JournalEntry.find(match).sort('date createdAt');

  const isDebitNormal = account.normalBalance === 'debit';
  let running = 0;
  const rows = [];

  entries.forEach((entry) => {
    entry.lines
      .filter((l) => l.account.equals(account._id))
      .forEach((l) => {
        const delta = isDebitNormal ? (l.debit - l.credit) : (l.credit - l.debit);
        running = round2(running + delta);
        rows.push({
          entryId: entry._id,
          entryNo: entry.entryNo,
          date: entry.date,
          description: entry.description,
          party: entry.party ? entry.party.name : undefined,
          debit: round2(l.debit),
          credit: round2(l.credit),
          balance: running
        });
      });
  });

  res.status(200).json({
    status: 'success',
    data: {
      account: { _id: account._id, code: account.code, name: account.name, type: account.type, normalBalance: account.normalBalance },
      rows,
      balance: running
    }
  });
});

/**
 * @desc    Finance dashboard summary cards + recent transactions.
 * @route   GET /api/v1/finance/dashboard
 * @access  Private
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const [accounts, totals, flow, recent] = await Promise.all([
    Account.find(),
    accountTotals(),
    JournalEntry.aggregate([
      { $match: { status: 'posted', source: 'payment' } },
      { $group: { _id: '$direction', total: { $sum: '$totalDebit' }, count: { $sum: 1 } } }
    ]),
    JournalEntry.find({ status: 'posted' }).sort('-date -createdAt').limit(8)
  ]);

  const byId = {};
  totals.forEach((t) => { byId[String(t._id)] = t; });

  const balanceOf = (acc) => {
    const t = byId[String(acc._id)] || { debit: 0, credit: 0 };
    return acc.normalBalance === 'debit' ? round2(t.debit - t.credit) : round2(t.credit - t.debit);
  };

  let cashOnHand = 0;
  let receivables = 0;
  let payables = 0;

  accounts.forEach((acc) => {
    if (acc.isPaymentAccount) cashOnHand = round2(cashOnHand + balanceOf(acc));
    if (acc.category === 'receivable') receivables = round2(receivables + balanceOf(acc));
    if (acc.category === 'payable') payables = round2(payables + balanceOf(acc));
  });

  const flowMap = {};
  flow.forEach((f) => { flowMap[f._id] = f; });

  res.status(200).json({
    status: 'success',
    data: {
      cashOnHand,
      totalReceived: round2(flowMap.in ? flowMap.in.total : 0),
      totalPaid: round2(flowMap.out ? flowMap.out.total : 0),
      receivables,
      payables,
      counts: {
        received: flowMap.in ? flowMap.in.count : 0,
        paid: flowMap.out ? flowMap.out.count : 0
      },
      recent
    }
  });
});
