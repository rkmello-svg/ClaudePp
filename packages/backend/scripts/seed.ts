/**
 * Seed script for ClaudePP Firebase database
 * Run: npx ts-node scripts/seed.ts
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
const serviceAccount = require('../../../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function seed() {
  console.log('Starting database seed...');

  try {
    // Create test store
    const storeId = uuidv4();
    const storeData = {
      id: storeId,
      name: 'Loja de Teste',
      cnpj: '12.345.678/0001-90',
      address: 'Rua Teste, 123 - São Paulo, SP',
      phone: '(11) 98765-4321',
      email: 'loja@example.com',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('stores').doc(storeId).set(storeData);
    console.log(`✓ Store created: ${storeId}`);

    // Create admin user
    const adminUser = await admin.auth().createUser({
      email: 'admin@example.com',
      password: 'password123',
      displayName: 'Admin User',
    });

    const adminUserData = {
      id: adminUser.uid,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      storeId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection('stores')
      .doc(storeId)
      .collection('users')
      .doc(adminUser.uid)
      .set(adminUserData);
    console.log(`✓ Admin user created: admin@example.com`);

    // Create manager user
    const managerUser = await admin.auth().createUser({
      email: 'manager@example.com',
      password: 'password123',
      displayName: 'Manager User',
    });

    const managerUserData = {
      id: managerUser.uid,
      email: 'manager@example.com',
      name: 'Manager User',
      role: 'manager',
      storeId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection('stores')
      .doc(storeId)
      .collection('users')
      .doc(managerUser.uid)
      .set(managerUserData);
    console.log(`✓ Manager user created: manager@example.com`);

    // Create cashier user
    const cashierUser = await admin.auth().createUser({
      email: 'cashier@example.com',
      password: 'password123',
      displayName: 'Cashier User',
    });

    const cashierUserData = {
      id: cashierUser.uid,
      email: 'cashier@example.com',
      name: 'Cashier User',
      role: 'cashier',
      storeId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection('stores')
      .doc(storeId)
      .collection('users')
      .doc(cashierUser.uid)
      .set(cashierUserData);
    console.log(`✓ Cashier user created: cashier@example.com`);

    // Create products
    const products = [
      {
        name: 'Notebook Dell',
        description: 'Notebook Dell Inspiron 15',
        barcode: '1234567890123',
        price: 2500.0,
        cost: 1800.0,
        stock: 10,
        category: 'Eletrônicos',
      },
      {
        name: 'Mouse Logitech',
        description: 'Mouse sem fio Logitech M705',
        barcode: '1234567890124',
        price: 150.0,
        cost: 80.0,
        stock: 50,
        category: 'Periféricos',
      },
      {
        name: 'Teclado Mecânico',
        description: 'Teclado mecânico RGB',
        barcode: '1234567890125',
        price: 400.0,
        cost: 250.0,
        stock: 20,
        category: 'Periféricos',
      },
      {
        name: 'Monitor LG 24"',
        description: 'Monitor LG 24 polegadas Full HD',
        barcode: '1234567890126',
        price: 800.0,
        cost: 500.0,
        stock: 15,
        category: 'Monitores',
      },
      {
        name: 'Webcam Logitech',
        description: 'Webcam Full HD 1080p',
        barcode: '1234567890127',
        price: 250.0,
        cost: 140.0,
        stock: 30,
        category: 'Periféricos',
      },
    ];

    for (const product of products) {
      const productId = uuidv4();
      const productData = {
        id: productId,
        storeId,
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        category: product.category,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .collection('stores')
        .doc(storeId)
        .collection('products')
        .doc(productId)
        .set(productData);
    }
    console.log(`✓ ${products.length} products created`);

    // Create sample sales
    const sales = [
      {
        items: [
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 1,
            unitPrice: 2500.0,
            discount: 0,
            subtotal: 2500.0,
          },
        ],
        subtotal: 2500.0,
        discount: 0,
        tax: 250.0,
        total: 2750.0,
        payment: {
          method: 'card',
          amount: 2750.0,
          status: 'approved',
        },
        status: 'completed',
      },
      {
        items: [
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 2,
            unitPrice: 150.0,
            discount: 0,
            subtotal: 300.0,
          },
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 1,
            unitPrice: 400.0,
            discount: 50.0,
            subtotal: 350.0,
          },
        ],
        subtotal: 650.0,
        discount: 50.0,
        tax: 60.0,
        total: 660.0,
        payment: {
          method: 'pix',
          amount: 660.0,
          status: 'approved',
        },
        status: 'completed',
      },
    ];

    for (const sale of sales) {
      const saleId = uuidv4();
      const saleData = {
        id: saleId,
        storeId,
        cashierId: cashierUser.uid,
        items: sale.items,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        payment: sale.payment,
        status: sale.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .collection('stores')
        .doc(storeId)
        .collection('sales')
        .doc(saleId)
        .set(saleData);
    }
    console.log(`✓ ${sales.length} sample sales created`);

    console.log('\n✓ Database seed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin:   admin@example.com / password123');
    console.log('  Manager: manager@example.com / password123');
    console.log('  Cashier: cashier@example.com / password123');
    console.log(`\nStore ID: ${storeId}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
