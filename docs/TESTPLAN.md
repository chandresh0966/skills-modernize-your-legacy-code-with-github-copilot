# School Accounting System - Test Plan

## Overview
This test plan covers all business logic and functionality of the COBOL-based school accounting system. The test cases are designed to validate account management operations including balance inquiries, credits, and debits with fund validation.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | System Initialization | System startup | 1. Start the application | Menu is displayed with options 1-4 | | | |
| TC-002 | View Balance - Initial Balance | Application running | 1. Select Option 1 (View Balance) | Display "Current balance: 1000.00" | | | |
| TC-003 | Navigate Menu - Valid Input | Application running | 1. Select Option 1<br/>2. Return to menu<br/>3. Verify menu is redisplayed | Menu reappears after operation completion | | | |
| TC-004 | Credit Account - Valid Amount | Balance = $1000.00 | 1. Select Option 2 (Credit Account)<br/>2. Enter amount: 500.00 | Display "Amount credited. New balance: 1500.00" | | | |
| TC-005 | Credit Account - Large Amount | Balance = $1500.00 | 1. Select Option 2<br/>2. Enter amount: 10000.00 | Display "Amount credited. New balance: 11500.00" | | | |
| TC-006 | Credit Account - Small Amount | Balance = $11500.00 | 1. Select Option 2<br/>2. Enter amount: 0.01 | Display "Amount credited. New balance: 11500.01" | | | |
| TC-007 | Debit Account - Valid Amount with Sufficient Funds | Balance = $11500.01 | 1. Select Option 3 (Debit Account)<br/>2. Enter amount: 500.00 | Display "Amount debited. New balance: 11000.01" | | | |
| TC-008 | Debit Account - Full Balance Withdrawal | Balance = $11000.01 | 1. Select Option 3<br/>2. Enter amount: 11000.01 | Display "Amount debited. New balance: 0.00" | | | |
| TC-009 | Debit Account - Insufficient Funds | Balance = $0.00 | 1. Select Option 3<br/>2. Enter amount: 100.00 | Display "Insufficient funds for this debit."<br/>Balance remains: $0.00 | | | |
| TC-010 | Debit Account - Amount Greater than Balance | Balance = $500.00 | 1. Select Option 3<br/>2. Enter amount: 750.00 | Display "Insufficient funds for this debit."<br/>Balance remains: $500.00 | | | |
| TC-011 | Debit Account - Exact Balance Amount | Balance = $500.00 | 1. Select Option 3<br/>2. Enter amount: 500.00 | Display "Amount debited. New balance: 0.00" | | | |
| TC-012 | Balance Persistence After Credit | Initial Balance = $1000.00 | 1. Select Option 2 (Credit)<br/>2. Enter 250.00<br/>3. Select Option 1 (View Balance) | First operation displays: "Amount credited. New balance: 1250.00"<br/>Second operation displays: "Current balance: 1250.00" | | | Balance should persist in storage |
| TC-013 | Balance Persistence After Debit | Initial Balance = $1250.00 | 1. Select Option 3 (Debit)<br/>2. Enter 100.00<br/>3. Select Option 1 (View Balance) | First operation displays: "Amount debited. New balance: 1150.00"<br/>Second operation displays: "Current balance: 1150.00" | | | Balance should persist in storage |
| TC-014 | Sequential Credits | Initial Balance = $1000.00 | 1. Credit: +$100 (Balance: $1100)<br/>2. Credit: +$200 (Balance: $1300)<br/>3. Credit: +$50 (Balance: $1350)<br/>4. View Balance | View Balance shows "Current balance: 1350.00" | | | Multiple sequential credits accumulate correctly |
| TC-015 | Sequential Debits | Initial Balance = $1350.00 | 1. Debit: -$100 (Balance: $1250)<br/>2. Debit: -$200 (Balance: $1050)<br/>3. Debit: -$50 (Balance: $1000)<br/>4. View Balance | View Balance shows "Current balance: 1000.00" | | | Multiple sequential debits accumulate correctly |
| TC-016 | Mixed Credit and Debit Operations | Initial Balance = $1000.00 | 1. Credit: +$500 (Balance: $1500)<br/>2. Debit: -$300 (Balance: $1200)<br/>3. Credit: +$200 (Balance: $1400)<br/>4. View Balance | View Balance shows "Current balance: 1400.00" | | | Credits and debits correctly update balance |
| TC-017 | Exit Application | Application running with any balance | 1. Select Option 4 (Exit) | Display "Exiting the program. Goodbye!"<br/>Application terminates | | | Program execution should stop |
| TC-018 | Invalid Menu Input | Application running | 1. Select Option 5 (Invalid choice) | Display "Invalid choice, please select 1-4."<br/>Menu redisplayed | | | System handles invalid input gracefully |
| TC-019 | Invalid Menu Input - Letter | Application running | 1. Enter 'A' instead of number | Display "Invalid choice, please select 1-4."<br/>Menu redisplayed | | | System rejects non-numeric input |
| TC-020 | Debit with Zero Amount | Balance = $1000.00 | 1. Select Option 3<br/>2. Enter amount: 0.00 | Display "Amount debited. New balance: 1000.00"<br/>Balance unchanged | | | Zero debit should be allowed (no validation rule against it) |
| TC-021 | Credit with Zero Amount | Balance = $1000.00 | 1. Select Option 2<br/>2. Enter amount: 0.00 | Display "Amount credited. New balance: 1000.00"<br/>Balance unchanged | | | Zero credit should be allowed |
| TC-022 | Maximum Balance Limit | Balance = $999999.00 | 1. Select Option 2<br/>2. Enter amount: 1.00 | Display "Amount credited. New balance: 1000000.00"<br/>Or error if system enforces max of 999999.99 | | | Test system limit (PIC 9(6)V99 = max 999999.99) |
| TC-023 | Maximum Balance Exceeded | Balance = $999999.99 | 1. Select Option 2<br/>2. Enter amount: 0.01 | System behavior with amount exceeding maximum | | | Test overflow handling for balances > 999999.99 |
| TC-024 | Debit Validation Boundary - Balance >= Amount | Balance = $100.00 | 1. Select Option 3<br/>2. Enter amount: 100.00 | Debit is allowed<br/>New balance: $0.00 | | | Test boundary condition: balance equals amount |
| TC-025 | Debit Validation Boundary - Balance < Amount (Off by 0.01) | Balance = $99.99 | 1. Select Option 3<br/>2. Enter amount: 100.00 | Display "Insufficient funds for this debit."<br/>Balance remains: $99.99 | | | Test boundary condition: insufficient by $0.01 |
| TC-026 | Decimal Precision - Credit | Balance = $1000.50 | 1. Select Option 2<br/>2. Enter amount: 123.45 | Display "Amount credited. New balance: 1123.95" | | | Verify correct decimal handling |
| TC-027 | Decimal Precision - Debit | Balance = $1123.95 | 1. Select Option 3<br/>2. Enter amount: 23.45 | Display "Amount debited. New balance: 1100.50" | | | Verify correct decimal handling |
| TC-028 | Menu Loop Continuation | Application running | 1. Perform operation (Credit)<br/>2. Menu should reappear<br/>3. Perform another operation (View Balance) | Menu appears after each operation<br/>Application continues to accept input | | | System should loop until Option 4 is selected |
| TC-029 | Application State - CONTINUE-FLAG Toggle | Application running with Option 4 pending | 1. Select Option 4<br/>2. Verify CONTINUE-FLAG = 'NO'<br/>3. Confirm program stops | Display "Exiting the program. Goodbye!"<br/>Application terminates cleanly | | | CONTINUE-FLAG should control program loop |
| TC-030 | Data Isolation - Multiple Operations | Tests run sequentially | Verify each test case doesn't affect previous balance state<br/>or that balance is reset between important test sequences | Each test case operates independently with expected balance | | | Tests should not interfere with each other if balance is persistent |

---

## Test Case Categories

### Category A: Core Operations
- TC-002: View Balance
- TC-004: Credit Account
- TC-007: Debit Account
- TC-012, TC-013: Balance Persistence

### Category B: Validation and Business Rules
- TC-009: Insufficient Funds Detection
- TC-010: Debit Rejection
- TC-011: Exact Amount Debit
- TC-024, TC-025: Boundary Conditions

### Category C: Data Accuracy and Precision
- TC-026, TC-027: Decimal Precision
- TC-014, TC-015, TC-016: Sequential Operations

### Category D: User Interface and Error Handling
- TC-001: System Initialization
- TC-018, TC-019: Invalid Input Handling
- TC-003: Menu Navigation
- TC-017: Exit Functionality

### Category E: Edge Cases and Limits
- TC-020, TC-021: Zero Amount Operations
- TC-022, TC-023: Maximum Balance Limits
- TC-028, TC-029: Program State Management

---

## Business Rules Covered

| Business Rule | Test Cases |
|---|---|
| Initial balance is $1,000.00 | TC-002, TC-009 |
| Credits are unrestricted | TC-004, TC-005, TC-006, TC-014, TC-020, TC-021 |
| Debits require sufficient funds | TC-009, TC-010, TC-011, TC-024, TC-025 |
| Balance must be >= debit amount | TC-007, TC-008, TC-009, TC-010, TC-011 |
| Balance persists after transactions | TC-012, TC-013, TC-014, TC-015, TC-016 |
| Decimal precision (2 places) | TC-026, TC-027 |
| Maximum supported balance: $999,999.99 | TC-022, TC-023 |
| Invalid menu choices handled gracefully | TC-018, TC-019 |
| Program loops until exit selected | TC-028, TC-029 |

---

## Notes for Node.js Migration

When converting these test cases to unit and integration tests in Node.js:

1. **Unit Tests** should focus on:
   - Individual function logic (credit, debit, validate funds)
   - Boundary conditions (TC-024, TC-025)
   - Decimal precision (TC-026, TC-027)

2. **Integration Tests** should focus on:
   - Balance persistence (TC-012, TC-013)
   - Sequential operations (TC-014, TC-015, TC-016)
   - Complete workflows (TC-004 → TC-008 → TC-017)

3. **Mock Requirements**:
   - Mock data storage layer (replaces `data.cob`)
   - Mock user input (replaces ACCEPT statement)
   - Mock display output (replaces DISPLAY statement)

4. **Test Fixtures**:
   - Initialize balance to $1,000.00 for each test
   - Reset balance between test cases
   - Use consistent test data values

5. **Automated Test Scenarios**:
   - Use Jest, Mocha, or similar framework
   - Parameterize tests for boundary values
   - Create test suites organized by business rule
