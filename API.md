# ClaudePP API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

### Header Format

```
Authorization: Bearer <token>
```

## Authentication Endpoints

### Login

```
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uid-123",
      "email": "user@example.com",
      "name": "User Name",
      "role": "cashier",
      "storeId": "store-123"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Register

```
POST /auth/register

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "cashier",
  "storeId": "store-123"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uid-123",
    "email": "user@example.com",
    "name": "User Name",
    "role": "cashier",
    "storeId": "store-123"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Profile

```
GET /auth/me

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "uid-123",
    "email": "user@example.com",
    "name": "User Name",
    "role": "cashier",
    "storeId": "store-123",
    "active": true,
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Logout

```
POST /auth/logout

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Products Endpoints

### Create Product

```
POST /products

Headers:
Authorization: Bearer <token>

Request:
{
  "name": "Product Name",
  "description": "Product Description",
  "barcode": "1234567890123",
  "price": 29.99,
  "cost": 15.00,
  "stock": 100,
  "category": "Electronics"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "product-123",
    "storeId": "store-123",
    "name": "Product Name",
    "barcode": "1234567890123",
    "price": 29.99,
    "stock": 100,
    "active": true,
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### List Products

```
GET /products?page=1&limit=20

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "product-123",
      "name": "Product Name",
      "barcode": "1234567890123",
      "price": 29.99,
      "stock": 100,
      "category": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Search Products

```
GET /products/search?q=laptop&category=Electronics&limit=20

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "product-123",
      "name": "Laptop Product Name",
      "barcode": "1234567890123",
      "price": 999.99,
      "stock": 50,
      "category": "Electronics"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Product by Barcode

```
GET /products/barcode/1234567890123

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Product Name",
    "barcode": "1234567890123",
    "price": 29.99,
    "stock": 100,
    "category": "Electronics"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Product by ID

```
GET /products/{productId}

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Product Name",
    "barcode": "1234567890123",
    "price": 29.99,
    "stock": 100,
    "category": "Electronics"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Update Product

```
PATCH /products/{productId}

Headers:
Authorization: Bearer <token>

Request:
{
  "price": 39.99,
  "stock": 50
}

Response (200):
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Product Name",
    "price": 39.99,
    "stock": 50,
    "updatedAt": "2024-01-01T12:30:00Z"
  },
  "timestamp": "2024-01-01T12:30:00Z"
}
```

### Delete Product (Soft Delete)

```
DELETE /products/{productId}

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "success": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Sales Endpoints

### Create Sale

```
POST /sales

Headers:
Authorization: Bearer <token>

Request:
{
  "items": [
    {
      "productId": "product-123",
      "quantity": 2,
      "unitPrice": 29.99,
      "discount": 5.00
    },
    {
      "productId": "product-456",
      "quantity": 1,
      "unitPrice": 99.99,
      "discount": 0
    }
  ],
  "payment": {
    "method": "cash",
    "amount": 154.97,
    "status": "approved"
  },
  "discountPercent": 0,
  "status": "completed"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "sale-123",
    "storeId": "store-123",
    "cashierId": "uid-123",
    "items": [
      {
        "id": "item-1",
        "productId": "product-123",
        "quantity": 2,
        "unitPrice": 29.99,
        "discount": 5.00,
        "subtotal": 54.98
      }
    ],
    "subtotal": 154.97,
    "discount": 0,
    "tax": 15.50,
    "total": 170.47,
    "payment": {
      "method": "cash",
      "amount": 170.47,
      "status": "approved"
    },
    "status": "completed",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### List Sales

```
GET /sales?page=1&limit=20&status=completed

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "sale-123",
      "cashierId": "uid-123",
      "total": 170.47,
      "items": [...],
      "status": "completed",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Get Sale by ID

```
GET /sales/{saleId}

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "sale-123",
    "storeId": "store-123",
    "cashierId": "uid-123",
    "items": [...],
    "total": 170.47,
    "status": "completed",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Update Sale Status

```
PATCH /sales/{saleId}

Headers:
Authorization: Bearer <token>

Request:
{
  "status": "cancelled"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "sale-123",
    "status": "cancelled",
    "updatedAt": "2024-01-01T12:30:00Z"
  },
  "timestamp": "2024-01-01T12:30:00Z"
}
```

### Get Sales Statistics

```
GET /sales/stats?startDate=2024-01-01&endDate=2024-01-31

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "totalSales": 150,
    "totalAmount": 25567.50,
    "totalItems": 450,
    "averageTicket": 170.45
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "details": "Invalid barcode format",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing token",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "error": "PRODUCT_NOT_FOUND",
  "message": "Product with ID product-123 not found",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 409 - Conflict

```json
{
  "success": false,
  "error": "USER_ALREADY_EXISTS",
  "message": "User with email user@example.com already exists",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Auth endpoints: 10 requests per 15 minutes per IP

## Pagination

All list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## Filtering

### Sales Filtering

- `status`: draft | completed | cancelled
- `startDate`: ISO 8601 date (YYYY-MM-DD)
- `endDate`: ISO 8601 date (YYYY-MM-DD)
- `cashierId`: Filter by cashier ID

### Products Filtering

- `category`: Product category
- `search`: Search term (name or barcode)

## Timestamps

All timestamps are in ISO 8601 format with UTC timezone.

## Version History

### v1.0.0 (2024-01-01)

- Initial API release
- Authentication endpoints
- Products CRUD
- Sales CRUD
- Statistics endpoints
