# Enterprise Features Guide - ClaudePP PDV

## Overview

ClaudePP PDV includes comprehensive enterprise features for multi-store operations, inventory management, financial reporting, and compliance tracking.

## Multi-Store Management

### Store Setup

#### Creating a New Store

```bash
POST /api/v1/stores
Content-Type: application/json

{
  "name": "Main Store",
  "cnpj": "12345678901234",
  "address": "Rua Principal, 123",
  "phone": "+55 11 9999-9999",
  "email": "store@example.com"
}
```

#### Listing All Stores

```bash
GET /api/v1/stores

Response:
[
  {
    "id": "store-1",
    "name": "Main Store",
    "cnpj": "12345678901234",
    "address": "Rua Principal, 123",
    "phone": "+55 11 9999-9999",
    "email": "store@example.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Updating Store Information

```bash
PATCH /api/v1/stores/:storeId
Content-Type: application/json

{
  "name": "Main Store - Updated",
  "phone": "+55 11 9999-8888"
}
```

### Store KPIs

View key performance indicators for each store:

```bash
GET /api/v1/stores/:storeId/kpis

Response:
{
  "storeId": "store-1",
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "totalRevenue": 45230.50,
  "totalTransactions": 1240,
  "averageTicket": 36.48,
  "topProduct": "Product Name",
  "topCashier": "Cashier Name",
  "stockTurnover": 4.2
}
```

## Stock Management

### Inventory Overview

#### Get Current Stock

```bash
GET /api/v1/stock?productId=prod-123

Response:
[
  {
    "productId": "prod-123",
    "productName": "Product Name",
    "currentStock": 50,
    "minThreshold": 10,
    "lastMovement": "2024-01-15T10:30:00Z",
    "status": "normal"
  }
]
```

### Stock Adjustments

#### Adjust Product Stock

```bash
PATCH /api/v1/stock/:productId
Content-Type: application/json

{
  "quantity": 25,
  "reason": "Physical inventory count adjustment",
  "reference": "INV-2024-01"
}
```

#### Reverse Stock Movement

```bash
POST /api/v1/stock/movements/:movementId/reverse
Content-Type: application/json

{
  "reason": "Incorrect adjustment - correcting"
}
```

### Stock History

#### View Stock Movements

```bash
GET /api/v1/stock/movements?startDate=2024-01-01&endDate=2024-01-31&type=adjustment

Response:
[
  {
    "id": "movement-1",
    "productId": "prod-123",
    "quantity": 25,
    "type": "adjustment",
    "reason": "Physical count",
    "userId": "user-1",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Stock Alerts

#### View Low Stock Alerts

```bash
GET /api/v1/stock/alerts

Response:
[
  {
    "id": "alert-1",
    "productId": "prod-456",
    "minThreshold": 10,
    "currentStock": 5,
    "triggered": true,
    "createdAt": "2024-01-15T14:00:00Z"
  }
]
```

## Reports and Analytics

### Sales Reports

#### Generate Sales Report

```bash
GET /api/v1/reports/sales?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "totalSales": 1240,
  "totalItems": 3150,
  "totalRevenue": 45230.50,
  "totalTax": 4523.05,
  "averageTicket": 36.48,
  "paymentMethods": [
    {
      "method": "card",
      "count": 800,
      "amount": 30000.00
    },
    {
      "method": "pix",
      "count": 350,
      "amount": 12000.00
    },
    {
      "method": "cash",
      "count": 90,
      "amount": 3230.50
    }
  ]
}
```

### Product Ranking

#### View Top Selling Products

```bash
GET /api/v1/reports/products-ranking?startDate=2024-01-01&endDate=2024-01-31

Response:
[
  {
    "productId": "prod-1",
    "name": "Product 1",
    "unitsSold": 850,
    "revenue": 12750.00,
    "costOfGoods": 5100.00,
    "profit": 7650.00,
    "margin": 0.60
  }
]
```

### Cashier Performance

#### View Cashier Statistics

```bash
GET /api/v1/reports/cashier-performance?startDate=2024-01-01&endDate=2024-01-31

Response:
[
  {
    "userId": "user-1",
    "name": "John Cashier",
    "totalSales": 320,
    "totalRevenue": 12000.00,
    "averageTicket": 37.50,
    "discountsGiven": 500.00,
    "returnedItems": 5
  }
]
```

### Revenue Metrics

#### Daily Revenue Analysis

```bash
GET /api/v1/reports/revenue?startDate=2024-01-01&endDate=2024-01-31

Response:
[
  {
    "date": "2024-01-01T00:00:00Z",
    "revenue": 1500.00,
    "transactionCount": 45,
    "averageTicket": 33.33
  }
]
```

## Audit and Compliance

### Audit Logs

#### View All Audit Logs

```bash
GET /api/v1/audit/logs?startDate=2024-01-01&endDate=2024-01-31

Response:
[
  {
    "id": "audit-1",
    "userId": "user-1",
    "action": "CREATE",
    "resource": "PRODUCT",
    "resourceId": "prod-123",
    "status": "success",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### User Activity Tracking

#### View User Actions

```bash
GET /api/v1/audit/user-actions/:userId

Response:
[
  {
    "id": "audit-1",
    "action": "CREATE_SALE",
    "resource": "SALE",
    "resourceId": "sale-123",
    "status": "success",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Change History

#### Product Change History

```bash
GET /api/v1/audit/product-changes/:productId

Response:
[
  {
    "id": "audit-1",
    "userId": "user-1",
    "action": "UPDATE",
    "resource": "PRODUCT",
    "changes": [
      {
        "field": "price",
        "before": 29.99,
        "after": 34.99
      }
    ],
    "status": "success",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

## Cash Register Management

### Register Operations

#### Create Cash Register

```bash
POST /api/v1/cash-registers
Content-Type: application/json

{
  "name": "Caixa 1",
  "number": 1
}
```

#### List Registers

```bash
GET /api/v1/cash-registers

Response:
[
  {
    "id": "register-1",
    "name": "Caixa 1",
    "number": 1,
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Shift Management

#### Open Shift

```bash
POST /api/v1/cash-registers/:registerId/open
Content-Type: application/json

{
  "cashierId": "user-1",
  "openingBalance": 500.00
}

Response:
{
  "id": "shift-1",
  "registerId": "register-1",
  "cashierId": "user-1",
  "openedAt": "2024-01-15T08:00:00Z",
  "openingBalance": 500.00,
  "status": "open"
}
```

#### Close Shift

```bash
POST /api/v1/cash-registers/:registerId/close
Content-Type: application/json

{
  "shiftId": "shift-1",
  "actualClosingBalance": 1250.00
}

Response:
{
  "id": "shift-1",
  "registerId": "register-1",
  "closedAt": "2024-01-15T18:00:00Z",
  "openingBalance": 500.00,
  "actualClosingBalance": 1250.00,
  "discrepancy": 750.00,
  "status": "closed"
}
```

### Shift Summary

#### Get Shift Details

```bash
GET /api/v1/cash-registers/:registerId/shifts/:shiftId/summary

Response:
{
  "shiftId": "shift-1",
  "cashierName": "John Cashier",
  "openedAt": "2024-01-15T08:00:00Z",
  "closedAt": "2024-01-15T18:00:00Z",
  "openingBalance": 500.00,
  "expectedClosingBalance": 500.00,
  "actualClosingBalance": 1250.00,
  "discrepancy": 750.00,
  "totalSales": 120,
  "totalTransactions": 125,
  "paymentMethods": [
    {
      "method": "card",
      "count": 100,
      "amount": 450.00
    },
    {
      "method": "cash",
      "count": 20,
      "amount": 300.00
    }
  ]
}
```

## User Roles and Permissions

### Role Definitions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, configurations |
| **Manager** | Store operations, reporting, employee management |
| **Cashier** | Point-of-sale operations, basic reporting |

### Assigning Roles

Users are assigned roles during creation and can be updated by administrators.

## Multi-Store Architecture

### Data Isolation

- Each store has isolated collections in Firestore
- Users are assigned to specific stores
- Reporting respects store boundaries
- Audit logs track store-specific activities

### Configuration per Store

Each store can have:
- Independent payment integrations
- Separate printer configurations
- Store-specific product catalog
- Custom reporting preferences
- Dedicated cash registers and users

## Compliance and Regulations

### Audit Trail

Complete audit trail includes:
- User authentication events
- Product and price modifications
- Payment processing details
- Sale completions and cancellations
- Stock adjustments
- User permission changes

### Data Retention

- Audit logs: 2 years (configurable)
- Transaction history: 5 years (configurable)
- User action logs: 1 year (configurable)

### Backup and Recovery

- Daily automated backups
- Point-in-time recovery available
- Encrypted storage
- Redundant backups across regions

## Best Practices

### Inventory Management
1. Conduct physical counts monthly
2. Investigate discrepancies promptly
3. Set appropriate minimum thresholds
4. Monitor stock turnover regularly

### Sales Analysis
1. Review daily sales reports
2. Track payment method trends
3. Monitor average ticket value
4. Compare performance across stores

### User Management
1. Assign minimum necessary permissions
2. Review user activity regularly
3. Disable accounts promptly
4. Maintain audit trail access logs

### Compliance
1. Review audit logs regularly
2. Maintain backup integrity
3. Keep audit logs for legal requirements
4. Document all policy changes

## Integration with POS Operations

The enterprise features integrate seamlessly with POS operations:
- Automatic stock updates on sales completion
- Automatic audit log entries for transactions
- Real-time KPI calculations
- Integrated payment reporting

## Support and Documentation

For detailed API documentation, refer to API.md

For integration questions, see INTEGRATION_GUIDE.md
