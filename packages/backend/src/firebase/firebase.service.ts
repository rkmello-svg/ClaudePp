import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: Firestore;
  private auth: Auth;

  constructor() {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      } as ServiceAccount;

      // Initialize Firebase Admin SDK
      initializeApp({
        credential: cert(serviceAccount),
      });

      this.firestore = getFirestore();
      this.auth = getAuth();

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getAuth(): Auth {
    return this.auth;
  }

  async createUser(email: string, password: string, displayName: string) {
    try {
      const user = await this.auth.createUser({
        email,
        password,
        displayName,
      });
      this.logger.log(`User created: ${user.uid}`);
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${email}`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error) {
      this.logger.debug(`User not found: ${email}`);
      return null;
    }
  }

  async deleteUser(uid: string) {
    try {
      await this.auth.deleteUser(uid);
      this.logger.log(`User deleted: ${uid}`);
    } catch (error) {
      this.logger.error(`Error deleting user: ${uid}`, error);
      throw error;
    }
  }

  async verifyIdToken(token: string) {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      this.logger.debug('Invalid ID token');
      return null;
    }
  }

  getCollectionPath(storeId: string, collection: string): string {
    return `stores/${storeId}/${collection}`;
  }

  async setupCollections() {
    this.logger.log('Firestore collections initialized');
  }
}
