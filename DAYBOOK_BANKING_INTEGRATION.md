# Daybook Banking Integration

## Overview

The daybook entries are now fully integrated with the banking module. This integration allows you to:
- Link daybook transactions to specific bank accounts
- Automatically update bank account balances when transactions occur
- Track which bank account was used for each payment
- Maintain accurate financial records across both modules

## How It Works

### 1. Bank Account Selection

When creating or editing a daybook entry:

1. **Select Mode of Payment**: Choose between Cash, UPI, or Account Transfer
2. **Account Transfer Mode**: When "Account Transfer" is selected, additional fields appear:
   - **Bank Account Dropdown**: Select which bank account to use
   - **Update Bank Balance Checkbox**: Choose whether this entry should automatically create a corresponding bank transaction

### 2. Automatic Balance Updates

When `affects_bank_balance` is enabled (default):

- **Incoming Payment**: Creates a deposit transaction in the selected bank account, increasing the balance
- **Outgoing Payment**: Creates a withdrawal transaction from the selected bank account, decreasing the balance

This ensures that your bank account balances always reflect the daybook transactions.

### 3. Data Fields

#### DaybookEntry Interface
```typescript
{
  // ... existing fields ...
  bank_account_id?: number | null;      // ID of the linked bank account
  affects_bank_balance?: boolean;        // Whether to create bank transaction
}
```

## Usage Examples

### Example 1: Client Payment Received via Bank Transfer

**Scenario**: Client pays ₹50,000 for nursing services via bank transfer

**Steps**:
1. Go to "Add Entry" page
2. Fill in details:
   - Payment Type: Incoming
   - Amount: 50,000
   - Payment Status: Paid
   - Mode of Payment: **Account Transfer**
   - Select Client: (choose from dropdown)
   - Bank Account: "HDFC Current - 1234567890"
   - Update Bank Balance: ✓ (checked)
   - Payment Category: Client Payment Received
   - Description: "Service payment for patient care"

**Result**:
- Daybook entry created showing incoming payment
- Bank account "HDFC Current" balance increases by ₹50,000
- Entry shows linked bank account in the table
- Green checkmark indicates balance was updated

### Example 2: Nurse Salary Payment

**Scenario**: Pay ₹30,000 salary to a nurse via bank transfer

**Steps**:
1. Go to "Add Entry" page
2. Fill in details:
   - Payment Type: Outgoing
   - Amount: 30,000
   - Payment Status: Paid
   - Mode of Payment: **Account Transfer**
   - Select Nurse: (choose from dropdown)
   - Bank Account: "HDFC Current - 1234567890"
   - Update Bank Balance: ✓ (checked)
   - Payment Category: Nurse Salary Paid
   - Description: "Monthly salary - March 2024"

**Result**:
- Daybook entry created showing outgoing payment
- Bank account "HDFC Current" balance decreases by ₹30,000
- Entry shows linked bank account in the table
- Green checkmark indicates balance was updated

### Example 3: Cash Transaction (No Bank Account)

**Scenario**: Receive ₹5,000 cash from client

**Steps**:
1. Go to "Add Entry" page
2. Fill in details:
   - Payment Type: Incoming
   - Amount: 5,000
   - Payment Status: Paid
   - Mode of Payment: **Cash** (or UPI)
   - Select Client: (choose from dropdown)
   - Description: "Cash payment"

**Result**:
- Daybook entry created
- No bank account linked (bank account field not shown)
- Bank balances remain unchanged
- Entry shows "-" in bank account column

## Table Display

### Desktop View
The daybook table includes a "Bank Account" column showing:
- Account name and number (e.g., "HDFC Current - 1234567890")
- Green checkmark (✓) if balance was automatically updated
- "-" if no bank account is linked

### Mobile View
Bank account information appears in the entry details:
- **Bank:** Account name and number
- Green checkmark (✓) if balance update is enabled

## Best Practices

### 1. When to Enable Balance Updates

**Enable (✓ checked)** when:
- The transaction has already occurred in the bank account
- You want to track the transaction in both daybook and banking modules
- The payment method is account transfer

**Disable (unchecked)** when:
- Recording a future transaction
- The transaction will be manually entered in the banking module separately
- You want to track the daybook entry but not affect bank balances yet

### 2. Validation Rules

- Bank account selection is **required** when mode of payment is "Account Transfer"
- You can only select bank accounts that exist in the system
- The form shows the current balance of each account in the dropdown

### 3. Multi-Tenancy Support

- Admin users can:
  - Select which tenant the entry belongs to
  - See all bank accounts across all tenants
  - View all entries in the daybook table
  
- Regular users (accountant/staff):
  - Automatically assigned to their tenant
  - See only their tenant's bank accounts
  - View only their tenant's entries

## API Integration

### Backend Requirements

The backend should handle:

1. **Creating Daybook Entry with Bank Account**:
   ```javascript
   POST /api/daybook/entries
   {
     "amount": 50000,
     "payment_type": "incoming",
     "mode_of_pay": "account_transfer",
     "bank_account_id": 5,
     "affects_bank_balance": true,
     // ... other fields
   }
   ```

2. **Automatic Bank Transaction Creation**:
   - When `affects_bank_balance` is true, backend should create corresponding bank transaction
   - Transaction type should match payment direction:
     - Incoming payment → Deposit transaction
     - Outgoing payment → Withdrawal transaction

3. **Balance Update**:
   - Update bank account `current_balance` field
   - Maintain transaction history in bank_transactions table

### Sample Backend Logic

```javascript
// In daybook entry creation endpoint
if (formData.affects_bank_balance && formData.bank_account_id) {
  const transactionType = formData.payment_type === 'incoming' 
    ? 'deposit' 
    : 'withdraw';
  
  // Create bank transaction
  await createBankTransaction({
    account_id: formData.bank_account_id,
    transaction_type: transactionType,
    amount: formData.amount,
    description: `Daybook Entry #${daybookEntryId}: ${formData.description}`,
    reference_number: `DAYBOOK-${daybookEntryId}`,
  });
}
```

## Troubleshooting

### Issue: "Bank account is required" error
**Solution**: Make sure you've selected a bank account from the dropdown when using "Account Transfer" mode.

### Issue: Bank account not showing in dropdown
**Solution**: 
1. Check if bank accounts exist (go to Banking > Bank Accounts)
2. If no accounts exist, create one first
3. Verify you have permission to view accounts for your tenant

### Issue: Balance not updating
**Solution**:
1. Check if "Update Bank Balance" checkbox was enabled
2. Verify the backend is creating the corresponding bank transaction
3. Check browser console for API errors

### Issue: Cannot see bank account column
**Solution**: 
1. On mobile, scroll down in the entry details
2. On desktop, scroll the table horizontally if screen is narrow

## Future Enhancements

Potential improvements to consider:

1. **Reconciliation View**: Show side-by-side comparison of daybook entries and bank transactions
2. **Bulk Import**: Import bank statements and auto-match with daybook entries
3. **Duplicate Detection**: Warn if creating similar entry that might already exist
4. **Transaction Reversal**: Allow reversing a daybook entry and its bank transaction together
5. **Reports**: Add reports showing daybook-to-bank account mapping analytics

## Related Documentation

- [Banking Module Guide](./BANKING_GUIDE.md)
- [API Documentation](./apiDocumentation/DOCS_API_ROUTES-1.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
