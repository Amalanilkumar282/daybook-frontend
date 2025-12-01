# Banking Module - Quick Start Guide

## 🏦 Overview
The banking module provides complete management of bank accounts and transactions (deposits, withdrawals, transfers, and cheques).

---

## 📍 Navigation

### Desktop
- Click **Bank Accounts** in the top navigation bar
- Click **Transactions** in the top navigation bar

### Mobile
- Tap the menu icon (☰)
- Select **Bank Accounts** or **Transactions**

---

## 💳 Bank Accounts Management

### Creating a New Bank Account

1. Navigate to **Banking → Bank Accounts**
2. Click **New Account** button
3. Fill in the required fields:
   - **Bank Name** (e.g., "State Bank of India")
   - **Account Name** (e.g., "Company Current Account")
   - **Short Form** (e.g., "SBI-CURR")
4. Optional fields:
   - Account Number
   - IFSC Code
   - Branch
   - Initial Balance
   - Tenant (Admin only)
5. Click **Create Account**

### Viewing Accounts
- All accounts displayed in a sortable table
- Click column headers to sort
- Use search bar to filter accounts
- View total balance at bottom

### Editing an Account
1. Click the **Edit** (pencil) icon on any account
2. Modify the fields
3. Click **Update Account**

### Deleting an Account
1. Click the **Delete** (trash) icon
2. Confirm the deletion
3. Note: This will cascade delete all transactions for this account

### Viewing Transactions for an Account
- Click the **View Transactions** (document) icon
- You'll be taken to the transactions page filtered for that account
- Click "Back to Accounts" to return

---

## 💸 Transactions Management

### Transaction Types

#### 1. **Deposit** 💰
Adds money to an account.

**Required Fields:**
- Account
- Amount

**Optional Fields:**
- Reference
- Description

**Example:** Receiving payment from a client into company account.

---

#### 2. **Withdraw** 💵
Removes money from an account (with balance validation).

**Required Fields:**
- Account
- Amount

**Optional Fields:**
- Reference
- Description

**Validation:** Ensures sufficient balance before processing.

**Example:** Withdrawing cash for office expenses.

---

#### 3. **Transfer** 🔄
Moves money from one account to another.

**Required Fields:**
- From Account
- To Account
- Amount

**Optional Fields:**
- Reference
- Description

**Validation:** 
- Sufficient balance in source account
- Source and destination must be different

**Example:** Transferring funds between company accounts.

---

#### 4. **Cheque** 📝
Issues a cheque from an account.

**Required Fields:**
- Account
- Amount
- Cheque Number

**Optional Fields:**
- Reference
- Description

**Validation:** Ensures sufficient balance.

**Example:** Issuing a cheque to pay a vendor.

---

## 🎯 Creating a Transaction

### Step-by-Step

1. Navigate to **Banking → Transactions**
2. Click **New Transaction**
3. Select the transaction type (Deposit/Withdraw/Transfer/Cheque)
4. The form will adjust based on your selection
5. Fill in the required fields
6. Add optional reference and description
7. Click **Submit Transaction**

### Transaction Type Selection
- Click on one of the four type buttons
- Form fields will dynamically change
- Balances are shown in account dropdowns

---

## 🔍 Viewing and Filtering Transactions

### Search
- Use the search bar to find transactions
- Searches across: amount, description, reference, cheque number, account names

### Filter by Type
- Use the "All Types" dropdown
- Select: Deposit, Withdraw, Transfer, or Cheque

### Sort by Date
- Click the date sort button
- Toggle between newest first (↓) and oldest first (↑)

### Account-Specific View
- View all transactions or filter by account
- When viewing account-specific transactions:
  - Current balance is displayed
  - "Back to Accounts" link available

---

## 📊 Dashboard Summaries

### Bank Accounts Page
- **Total Balance:** Sum of all account balances
- **Account Count:** Number of active accounts

### Transactions Page
Shows summaries for displayed transactions:
- **Total Transactions:** Count
- **Total Deposits:** Sum of all deposits
- **Total Withdrawals:** Sum of withdrawals + cheques
- **Total Transfers:** Sum of transfer amounts

---

## 📤 Exporting Data

### Export Transactions to CSV
1. Click the **Export** button on Transactions page
2. CSV file downloads automatically
3. Includes: Date, Type, Account, Amount, Status, etc.

### Export from Accounts Page
- Exports all transaction data
- Click **Export** button on Bank Accounts page

---

## 🎨 Visual Indicators

### Transaction Types (Color-Coded)
- 🟢 **Deposit** - Green badge
- 🔴 **Withdraw** - Red badge
- 🔵 **Transfer** - Blue badge
- 🟣 **Cheque** - Purple badge

### Transaction Status
- 🟢 **Completed** - Green badge
- 🟡 **Pending** - Yellow badge
- 🔴 **Failed** - Red badge

### Balance Display
- 🟢 Positive balance - Green text
- 🔴 Negative balance - Red text

---

## ⚠️ Validations and Business Rules

### Balance Validation
- Withdrawals and cheques check for sufficient funds
- Transfers validate source account balance
- Clear error messages when insufficient funds

### Account Validation
- Transfer source and destination must be different
- All required fields must be filled
- Amounts must be positive numbers

### Cheque Requirements
- Cheque number is mandatory for cheque transactions
- Must be unique (frontend doesn't enforce, backend should)

---

## 🔐 Permissions

### Admin Users
- Can select tenant for accounts
- Can view all accounts across tenants
- Can view all transactions across tenants

### Non-Admin Users
- Automatically filtered to their tenant
- Cannot change tenant
- See only their tenant's accounts and transactions

---

## 💡 Tips and Best Practices

### Account Management
1. Use meaningful short forms (e.g., "SBI-SAV", "HDFC-CURR")
2. Keep account numbers and IFSC updated
3. Regularly reconcile balances

### Transaction Management
1. Always add reference numbers for tracking
2. Use descriptions for audit trails
3. Review transactions before confirming
4. Export regularly for backup

### Data Organization
1. Use consistent naming for accounts
2. Add detailed descriptions
3. Reference external invoice/document numbers
4. Regular exports for record-keeping

---

## 🐛 Troubleshooting

### "Insufficient Balance" Error
- Check the account's current balance
- Ensure you're not trying to withdraw/transfer more than available
- Wait for pending transactions to complete

### Cannot Delete Account
- Ensure no pending transactions
- Backend may prevent deletion of accounts with transaction history
- Consider archiving instead (if feature available)

### Transaction Not Appearing
- Refresh the page
- Check if filtered by type or search term
- Verify transaction was successful (check for success message)

### Form Validation Errors
- All required fields must be filled
- Amount must be greater than 0
- Check that accounts are selected correctly

---

## 📱 Mobile Usage

### Optimizations
- Touch-friendly buttons and inputs
- Responsive tables (scroll horizontally if needed)
- Collapsible menu for easy navigation
- Large tap targets for actions

### Best Practices on Mobile
1. Use landscape mode for tables
2. Search before browsing long lists
3. Export on desktop for easier viewing

---

## 🎓 Example Workflows

### Opening a New Company Account
1. Bank Accounts → New Account
2. Bank Name: "State Bank of India"
3. Account Name: "TATANursing Operations"
4. Short Form: "SBI-OPS"
5. Account Number: (from bank)
6. IFSC: (from bank)
7. Initial Balance: 100000
8. Create Account ✓

### Recording a Deposit
1. Transactions → New Transaction
2. Type: Deposit
3. Account: SBI-OPS
4. Amount: 50000
5. Reference: "INV-2025-001"
6. Description: "Client payment received"
7. Submit ✓

### Transferring Between Accounts
1. Transactions → New Transaction
2. Type: Transfer
3. From: SBI-OPS
4. To: HDFC-SAV
5. Amount: 25000
6. Reference: "TRANS-001"
7. Description: "Monthly allocation"
8. Submit ✓

### Issuing a Cheque
1. Transactions → New Transaction
2. Type: Cheque
3. Account: SBI-OPS
4. Amount: 15000
5. Cheque Number: "CHQ-456789"
6. Description: "Vendor payment - ABC Supplies"
7. Submit ✓

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Verify all required fields are filled
3. Check your internet connection
4. Refresh the page
5. Contact system administrator

---

**Last Updated:** December 1, 2025
**Version:** 1.0.0
