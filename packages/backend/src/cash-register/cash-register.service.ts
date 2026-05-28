import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CashRegister, Shift, ShiftSummary } from '@claudepp/shared';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CashRegisterService {
  private readonly logger = new Logger(CashRegisterService.name);

  constructor(private firebaseService: FirebaseService) {}

  async createRegister(storeId: string, name: string, number: number): Promise<CashRegister> {
    const id = uuid();
    const register: CashRegister = {
      id,
      storeId,
      name,
      number,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(id)
      .set(register);

    this.logger.log(`Cash register created: ${id}`);
    return register;
  }

  async openShift(registerId: string, storeId: string, cashierId: string, openingBalance: number): Promise<Shift> {
    const shiftId = uuid();
    const shift: Shift = {
      id: shiftId,
      cashRegisterId: registerId,
      cashierId,
      openedAt: new Date(),
      openingBalance,
      status: 'open',
      transactions: [],
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(registerId)
      .collection('shifts')
      .doc(shiftId)
      .set(shift);

    this.logger.log(`Shift opened: ${shiftId}`);
    return shift;
  }

  async closeShift(registerId: string, storeId: string, shiftId: string, closingBalance: number): Promise<Shift> {
    const doc = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(registerId)
      .collection('shifts')
      .doc(shiftId)
      .get();

    if (!doc.exists) {
      throw new Error('Shift not found');
    }

    const shift = doc.data() as Shift;
    const updated: Shift = {
      ...shift,
      closedAt: new Date(),
      actualClosingBalance: closingBalance,
      discrepancy: closingBalance - shift.openingBalance,
      status: 'closed',
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(registerId)
      .collection('shifts')
      .doc(shiftId)
      .set(updated);

    this.logger.log(`Shift closed: ${shiftId}`);
    return updated;
  }

  async getShiftSummary(registerId: string, storeId: string, shiftId: string): Promise<ShiftSummary> {
    const doc = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(registerId)
      .collection('shifts')
      .doc(shiftId)
      .get();

    if (!doc.exists) {
      throw new Error('Shift not found');
    }

    const shift = doc.data() as Shift;
    // TODO: Get actual transaction summary
    return {
      shiftId,
      cashierName: '',
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      openingBalance: shift.openingBalance,
      expectedClosingBalance: shift.openingBalance,
      actualClosingBalance: shift.actualClosingBalance,
      discrepancy: shift.discrepancy,
      totalSales: 0,
      totalTransactions: 0,
      paymentMethods: [],
    };
  }

  async listRegisters(storeId: string): Promise<CashRegister[]> {
    const snapshot = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .get();

    return snapshot.docs.map(doc => doc.data() as CashRegister);
  }

  async getRegister(storeId: string, registerId: string): Promise<CashRegister> {
    const doc = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('cash-registers')
      .doc(registerId)
      .get();

    if (!doc.exists) {
      throw new Error('Register not found');
    }

    return doc.data() as CashRegister;
  }
}
