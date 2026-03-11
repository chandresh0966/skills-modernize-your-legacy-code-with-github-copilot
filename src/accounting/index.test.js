'use strict';

/**
 * Unit Tests — School Account Management System (Node.js)
 * Mirrors the test cases defined in docs/TESTPLAN.md
 *
 * readline-sync is mocked so tests can drive input without a real terminal.
 * console.log is spied on to assert display output.
 */

jest.mock('readline-sync');

const readlineSync = require('readline-sync');
const { DataStore, Operations } = require('./index');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a fresh DataStore pre-loaded with a given balance. */
function storeWithBalance(amount) {
  const store = new DataStore();
  store.write(amount);
  return store;
}

// ---------------------------------------------------------------------------
// DataStore — unit tests (data.cob equivalent)
// ---------------------------------------------------------------------------
describe('DataStore', () => {
  test('TC-002 | Initial balance is $1000.00', () => {
    const store = new DataStore();
    expect(store.read()).toBe(1000.00);
  });

  test('READ returns current stored balance', () => {
    const store = new DataStore();
    store.write(500.00);
    expect(store.read()).toBe(500.00);
  });

  test('WRITE persists updated balance with 2 decimal precision', () => {
    const store = new DataStore();
    store.write(1234.567);          // should round to 2 dp
    expect(store.read()).toBe(1234.57);
  });

  test('WRITE accepts zero balance', () => {
    const store = new DataStore();
    store.write(0);
    expect(store.read()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Operations.total() — TC-002, TC-012, TC-013
// ---------------------------------------------------------------------------
describe('Operations.total()', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('TC-002 | Displays initial balance of $1000.00', () => {
    const ops = new Operations(new DataStore());
    ops.total();
    expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  });

  test('TC-012 | Displays balance after a credit', () => {
    const store = storeWithBalance(1250.00);
    const ops = new Operations(store);
    ops.total();
    expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1250.00');
  });

  test('TC-013 | Displays balance after a debit', () => {
    const store = storeWithBalance(1150.00);
    const ops = new Operations(store);
    ops.total();
    expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1150.00');
  });
});

// ---------------------------------------------------------------------------
// Operations.credit() — TC-004, TC-005, TC-006, TC-012, TC-014, TC-020, TC-021
// ---------------------------------------------------------------------------
describe('Operations.credit()', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('TC-004 | Credits $500 to $1000 balance → $1500', () => {
    readlineSync.question.mockReturnValue('500');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1500.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
  });

  test('TC-005 | Credits large amount $10000 to $1500 balance → $11500', () => {
    readlineSync.question.mockReturnValue('10000');
    const store = storeWithBalance(1500.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(11500.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 11500.00');
  });

  test('TC-006 | Credits small amount $0.01 to $11500 balance → $11500.01', () => {
    readlineSync.question.mockReturnValue('0.01');
    const store = storeWithBalance(11500.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(11500.01);
    expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 11500.01');
  });

  test('TC-012 | Balance persists after credit (credit then read)', () => {
    readlineSync.question.mockReturnValue('250');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1250.00);
  });

  test('TC-014 | Sequential credits accumulate correctly', () => {
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);

    readlineSync.question.mockReturnValue('100');
    ops.credit(); // 1100

    readlineSync.question.mockReturnValue('200');
    ops.credit(); // 1300

    readlineSync.question.mockReturnValue('50');
    ops.credit(); // 1350

    expect(store.read()).toBe(1350.00);
  });

  test('TC-020 | Credits zero amount — balance unchanged', () => {
    readlineSync.question.mockReturnValue('0');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
  });

  test('TC-021 | Credits zero (0.00) amount explicitly — balance unchanged', () => {
    readlineSync.question.mockReturnValue('0.00');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000.00);
  });

  test('TC-026 | Decimal precision: $1000.50 + $123.45 = $1123.95', () => {
    readlineSync.question.mockReturnValue('123.45');
    const store = storeWithBalance(1000.50);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1123.95);
    expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1123.95');
  });

  test('Invalid credit amount (non-numeric) — no balance change', () => {
    readlineSync.question.mockReturnValue('abc');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
  });

  test('Negative credit amount — no balance change', () => {
    readlineSync.question.mockReturnValue('-100');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
  });
});

// ---------------------------------------------------------------------------
// Operations.debit() — TC-007, TC-008, TC-009, TC-010, TC-011, TC-013,
//                       TC-015, TC-024, TC-025, TC-027
// ---------------------------------------------------------------------------
describe('Operations.debit()', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('TC-007 | Debits $500 from $11500.01 → $11000.01', () => {
    readlineSync.question.mockReturnValue('500');
    const store = storeWithBalance(11500.01);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(11000.01);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 11000.01');
  });

  test('TC-008 | Full balance withdrawal — balance becomes $0.00', () => {
    readlineSync.question.mockReturnValue('11000.01');
    const store = storeWithBalance(11000.01);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(0.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  });

  test('TC-009 | Debit $100 from $0 balance — insufficient funds', () => {
    readlineSync.question.mockReturnValue('100');
    const store = storeWithBalance(0.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(0.00);
    expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  });

  test('TC-010 | Debit $750 from $500 balance — insufficient funds', () => {
    readlineSync.question.mockReturnValue('750');
    const store = storeWithBalance(500.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(500.00);
    expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  });

  test('TC-011 | Debit exact balance $500 from $500 → $0.00', () => {
    readlineSync.question.mockReturnValue('500');
    const store = storeWithBalance(500.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(0.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  });

  test('TC-013 | Balance persists after debit (debit then read)', () => {
    readlineSync.question.mockReturnValue('100');
    const store = storeWithBalance(1250.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(1150.00);
  });

  test('TC-015 | Sequential debits accumulate correctly', () => {
    const store = storeWithBalance(1350.00);
    const ops = new Operations(store);

    readlineSync.question.mockReturnValue('100');
    ops.debit(); // 1250

    readlineSync.question.mockReturnValue('200');
    ops.debit(); // 1050

    readlineSync.question.mockReturnValue('50');
    ops.debit(); // 1000

    expect(store.read()).toBe(1000.00);
  });

  test('TC-020 | Debits zero amount — balance unchanged', () => {
    readlineSync.question.mockReturnValue('0');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
  });

  test('TC-024 | Boundary: balance ($100) exactly equals debit ($100) — allowed', () => {
    readlineSync.question.mockReturnValue('100');
    const store = storeWithBalance(100.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(0.00);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  });

  test('TC-025 | Boundary: balance ($99.99) < debit ($100) — insufficient funds', () => {
    readlineSync.question.mockReturnValue('100');
    const store = storeWithBalance(99.99);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(99.99);
    expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  });

  test('TC-027 | Decimal precision: $1123.95 - $23.45 = $1100.50', () => {
    readlineSync.question.mockReturnValue('23.45');
    const store = storeWithBalance(1123.95);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(1100.50);
    expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1100.50');
  });

  test('Invalid debit amount (non-numeric) — no balance change', () => {
    readlineSync.question.mockReturnValue('xyz');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
  });

  test('Negative debit amount — no balance change', () => {
    readlineSync.question.mockReturnValue('-50');
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);
    ops.debit();
    expect(store.read()).toBe(1000.00);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
  });
});

// ---------------------------------------------------------------------------
// Mixed operations — TC-016, TC-030
// ---------------------------------------------------------------------------
describe('Mixed credit and debit operations', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('TC-016 | Credit +$500, Debit -$300, Credit +$200 → $1400', () => {
    const store = storeWithBalance(1000.00);
    const ops = new Operations(store);

    readlineSync.question.mockReturnValue('500');
    ops.credit(); // 1500

    readlineSync.question.mockReturnValue('300');
    ops.debit(); // 1200

    readlineSync.question.mockReturnValue('200');
    ops.credit(); // 1400

    expect(store.read()).toBe(1400.00);
    ops.total();
    expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1400.00');
  });

  test('TC-030 | DataStore isolation — each test has independent state', () => {
    const storeA = new DataStore();
    const storeB = new DataStore();

    storeA.write(500.00);
    // storeB should still be at its own initial 1000.00
    expect(storeB.read()).toBe(1000.00);
    expect(storeA.read()).toBe(500.00);
  });
});

// ---------------------------------------------------------------------------
// Maximum balance edge cases — TC-022, TC-023
// ---------------------------------------------------------------------------
describe('Maximum balance edge cases', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('TC-022 | Credit $1 to $999999 → $1000000 (beyond COBOL PIC 9(6)V99 limit)', () => {
    readlineSync.question.mockReturnValue('1');
    const store = storeWithBalance(999999.00);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000000.00);
  });

  test('TC-023 | Credit $0.01 to $999999.99 → $1000000.00 (overflow boundary)', () => {
    readlineSync.question.mockReturnValue('0.01');
    const store = storeWithBalance(999999.99);
    const ops = new Operations(store);
    ops.credit();
    expect(store.read()).toBe(1000000.00);
  });
});
