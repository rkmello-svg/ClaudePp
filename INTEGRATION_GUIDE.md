# Integration Guide - ClaudePP PDV

## Overview

This guide covers the configuration and integration of external devices and services with the ClaudePP PDV system.

## TEF (Electronic Funds Transfer) Integration

### Stone TEF

#### Prerequisites
- Stone account and merchant credentials
- Stone API credentials (API Key and Secret)
- Terminal ID for the payment machine

#### Configuration Steps

1. Navigate to **Integration Panel** → **Stone TEF**
2. Click **Configure**
3. Enter the following information:
   - **Merchant ID**: Your Stone merchant ID
   - **Terminal ID**: Your payment terminal ID
   - **API Key**: Your Stone API key
   - **API Secret**: Your Stone API secret

4. Click **Test Connection** to verify the integration
5. Enable the integration after successful test

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection failed | Verify internet connection and API credentials |
| Terminal not found | Check Terminal ID in Stone Dashboard |
| Invalid credentials | Re-generate API keys in Stone Portal |
| Transaction declined | Verify merchant account is active |

### Elo TEF

#### Configuration Steps

1. Navigate to **Integration Panel** → **Elo TEF**
2. Click **Configure**
3. Enter Elo credentials (similar to Stone)
4. Click **Test Connection**
5. Enable after successful test

### Ingenico TEF

#### Configuration Steps

1. Navigate to **Integration Panel** → **Ingenico TEF**
2. Click **Configure**
3. Enter Ingenico credentials
4. Click **Test Connection**
5. Enable after successful test

## Thermal Printer Integration

### ESCPOS Printer (via Bluetooth/USB)

#### Prerequisites
- ESCPOS compatible thermal printer
- Printer drivers installed on POS device
- USB or Bluetooth connection to POS

#### Configuration Steps

1. Navigate to **Integration Panel** → **Thermal Printer**
2. Click **Configure**
3. Select connection type:
   - **USB**: Select COM port (e.g., COM1, /dev/ttyUSB0)
   - **Bluetooth**: Select paired device
4. Set **Baud Rate** (default: 9600)
5. Click **Test Print**
6. Enable if test is successful

#### Testing Receipt Printing

```bash
POST /api/v1/printer/test-print
```

Response:
```json
{
  "success": true,
  "message": "Test page printed successfully"
}
```

#### Printing Real Receipts

```bash
POST /api/v1/printer/print-receipt
Content-Type: application/json

{
  "saleId": "sale-123",
  "content": "Receipt content...",
  "copies": 1
}
```

## Barcode Scanner Integration

### EAN-13 and UPC Barcode Support

#### Configuration Steps

1. Navigate to **Integration Panel** → **Barcode Scanner**
2. Click **Configure**
3. Select barcode format:
   - **EAN-13** (default): 13-digit barcodes
   - **UPC**: Universal Product Code
   - **Code128**: Custom formats
4. Click **Test**
5. Enable after successful test

#### Using Barcode Search

```bash
GET /api/v1/barcode/search/5901234123457

Response:
{
  "productId": "prod-123",
  "barcode": "5901234123457",
  "name": "Product Name",
  "price": 29.99,
  "stock": 50
}
```

#### Validating Barcodes

```bash
POST /api/v1/barcode/validate
Content-Type: application/json

{
  "barcode": "5901234123457",
  "format": "ean13"
}

Response:
{
  "valid": true,
  "format": "EAN-13",
  "value": "5901234123457"
}
```

## Payment Processing

### Processing Card Payment

```bash
POST /api/v1/payments/process-card
Content-Type: application/json

{
  "saleId": "sale-123",
  "amount": 99.99,
  "method": "card",
  "installments": 3,
  "cardData": {
    "number": "4111111111111111",
    "holderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

### Processing PIX Payment

```bash
POST /api/v1/payments/process-pix
Content-Type: application/json

{
  "saleId": "sale-123",
  "amount": 99.99,
  "method": "pix",
  "pixData": {
    "cpfCnpj": "12345678901234"
  }
}
```

### Processing Cash Payment

```bash
POST /api/v1/payments/process-cash
Content-Type: application/json

{
  "saleId": "sale-123",
  "amount": 99.99,
  "method": "cash"
}
```

### Getting Payment Status

```bash
GET /api/v1/payments/status/txn-123

Response:
{
  "id": "txn-123",
  "storeId": "store-1",
  "saleId": "sale-123",
  "amount": 99.99,
  "method": "card",
  "status": "approved",
  "transactionId": "STONE_123456",
  "authCode": "123456",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:05Z"
}
```

## Integration Status Monitoring

### Check Integration Status

Navigate to **Integration Panel** to view:
- Real-time connection status for each integration
- Last successful connection time
- Error messages if any
- Transaction history and logs

### Integration Logs

Each integration maintains logs of:
- Successful transactions
- Failed attempts with error details
- Connection status changes
- Configuration changes

## Custom Webhooks

### Setting Up Webhooks

1. Navigate to **Integration Panel** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **Event Type**: (payment, stock, sale, etc.)
   - **URL**: Webhook endpoint URL
   - **Method**: GET/POST/PUT
   - **Headers**: Custom headers if needed
4. Click **Test Webhook**
5. Enable after successful test

### Webhook Events

Available webhook events:
- `payment.processed` - Payment transaction completed
- `receipt.printed` - Receipt printed successfully
- `stock.adjusted` - Stock level changed
- `sale.completed` - Sale transaction finalized
- `shift.opened` - Cash register shift opened
- `shift.closed` - Cash register shift closed

## Troubleshooting

### Integration Panel Not Loading

1. Clear browser cache
2. Check network connection
3. Verify API is running
4. Check browser console for errors

### Connection Tests Failing

1. Verify internet connectivity
2. Check firewall settings
3. Validate credentials again
4. Restart the service

### Printer Not Printing

1. Verify physical connection (USB/Bluetooth)
2. Check printer drivers are installed
3. Ensure paper supply
4. Test with system print dialog first
5. Restart printer and application

### Barcode Scanner Not Working

1. Verify scanner is paired/connected
2. Test barcode format matches configuration
3. Check scanner permissions in system settings
4. Try with different product barcodes

### Payment Processing Failures

1. Check payment provider status page
2. Verify merchant account has sufficient balance
3. Check API credentials are correct and active
4. Review audit logs for specific error messages
5. Contact payment provider support with transaction ID

## Best Practices

1. **Regular Testing**: Test all integrations weekly
2. **Monitor Logs**: Review transaction logs daily
3. **Backup Credentials**: Store credentials securely
4. **Update Drivers**: Keep printer drivers updated
5. **Network Monitoring**: Monitor integration connection stability
6. **Error Handling**: Set up alerts for integration failures
7. **Compliance**: Maintain audit logs for compliance

## API Reference

### Payment Endpoints
- `POST /api/v1/payments/process-card` - Card payment
- `POST /api/v1/payments/process-pix` - PIX payment
- `POST /api/v1/payments/process-cash` - Cash payment
- `GET /api/v1/payments/status/:transactionId` - Payment status
- `GET /api/v1/payments/methods` - Available payment methods

### Printer Endpoints
- `POST /api/v1/printer/print-receipt` - Print receipt
- `POST /api/v1/printer/test-print` - Test printer
- `GET /api/v1/printer/status` - Printer status

### Barcode Endpoints
- `POST /api/v1/barcode/validate` - Validate barcode
- `GET /api/v1/barcode/search/:code` - Search product by barcode

## Support

For integration issues:
1. Check this guide first
2. Review integration logs in admin panel
3. Contact support with:
   - Integration type and provider
   - Error message and error code
   - Steps to reproduce
   - Screenshots of Integration Panel
