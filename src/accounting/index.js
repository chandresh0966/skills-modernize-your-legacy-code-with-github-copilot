'use strict';

/**
 * School Account Management System
 * Converted from COBOL (main.cob, operations.cob, data.cob)
 *
 * data.cob     → DataStore class  (balance storage / READ-WRITE)
 * operations.cob → Operations class (TOTAL, CREDIT, DEBIT logic)
 * main.cob     → main()           (menu loop & user interaction)
 */

const readlineSync = require('readline-sync');

// ---------------------------------------------------------------------------
// DataStore — equivalent to data.cob
// Holds the single persistent balance for the session (STORAGE-BALANCE).
// Supports READ and WRITE operations via get/set methods.
// ---------------------------------------------------------------------------
class DataStore {
  constructor() {
    // PIC 9(6)V99 VALUE 1000.00 — initial student account balance
    this._storageBalance = 1000.00;
  }

  /**
   * READ: return the current balance (2 decimal places)
   * @returns {number}
   */
  read() {
    return this._storageBalance;
  }

  /**
   * WRITE: persist a new balance value
   * @param {number} balance
   */
  write(balance) {
    this._storageBalance = parseFloat(balance.toFixed(2));
  }
}

// ---------------------------------------------------------------------------
// Operations — equivalent to operations.cob
// Implements TOTAL, CREDIT and DEBIT operations.
// Business rules:
//   - CREDIT: unrestricted; adds amount to balance then persists
//   - DEBIT:  only allowed when FINAL-BALANCE >= AMOUNT (no overdraft)
// ---------------------------------------------------------------------------
class Operations {
  /**
   * @param {DataStore} dataStore
   */
  constructor(dataStore) {
    this._dataStore = dataStore;
  }

  /**
   * TOTAL — display current balance
   */
  total() {
    const balance = this._dataStore.read();
    console.log(`Current balance: ${balance.toFixed(2)}`);
  }

  /**
   * CREDIT — add funds to the account
   */
  credit() {
    const input = readlineSync.question('Enter credit amount: ');
    const amount = parseFloat(input);

    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a positive number.');
      return;
    }

    let balance = this._dataStore.read();
    balance += amount;
    this._dataStore.write(balance);
    console.log(`Amount credited. New balance: ${balance.toFixed(2)}`);
  }

  /**
   * DEBIT — subtract funds from the account
   * Business rule: only proceeds when balance >= amount (prevents overdraft)
   */
  debit() {
    const input = readlineSync.question('Enter debit amount: ');
    const amount = parseFloat(input);

    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a positive number.');
      return;
    }

    const balance = this._dataStore.read();

    if (balance >= amount) {
      const newBalance = balance - amount;
      this._dataStore.write(newBalance);
      console.log(`Amount debited. New balance: ${newBalance.toFixed(2)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
}

// ---------------------------------------------------------------------------
// main — equivalent to main.cob
// Implements the menu loop (PERFORM UNTIL CONTINUE-FLAG = 'NO')
// ---------------------------------------------------------------------------
function main() {
  const dataStore = new DataStore();
  const operations = new Operations(dataStore);

  let continueFlag = true; // equivalent to CONTINUE-FLAG = 'YES'

  while (continueFlag) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = readlineSync.question('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1':
        operations.total();
        break;
      case '2':
        operations.credit();
        break;
      case '3':
        operations.debit();
        break;
      case '4':
        continueFlag = false; // equivalent to MOVE 'NO' TO CONTINUE-FLAG
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  console.log('Exiting the program. Goodbye!');
}

// ---------------------------------------------------------------------------
// Entry point — only run main() when executed directly (not when required
// as a module, so that unit tests can import classes without side-effects)
// ---------------------------------------------------------------------------
if (require.main === module) {
  main();
}

module.exports = { DataStore, Operations };
