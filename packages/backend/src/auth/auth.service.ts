import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Firestore } from 'firebase-admin/firestore';

interface AuthUser {
  sub: string;
  email: string;
  uid: string;
  role: string;
  storeId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private firestore: Firestore;

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
  ) {
    this.firestore = firebaseService.getFirestore();
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, storeId } = registerDto;

    try {
      // Check if user already exists in Firebase
      const existingUser = await this.firebaseService.getUserByEmail(email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user in Firebase Auth
      const firebaseUser = await this.firebaseService.createUser(email, password, name);

      // Store user metadata in Firestore
      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'users'))
        .doc(firebaseUser.uid)
        .set({
          id: firebaseUser.uid,
          email,
          name,
          role,
          storeId,
          active: true,
          createdAt: new Date(),
        });

      this.logger.log(`User registered: ${email}`);

      return {
        id: firebaseUser.uid,
        email,
        name,
        role,
        storeId,
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${email}`, error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Validate email and password with Firebase Admin SDK
      const user = await this.firebaseService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password by attempting to sign in via Firebase REST API
      const isPasswordValid = await this.firebaseService.verifyPassword(email, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Fetch user profile from Firestore to get actual role and storeId
      const userProfile = await this.getUserProfileFromFirestore(user.uid);

      if (!userProfile) {
        throw new UnauthorizedException('User profile not found');
      }

      // Generate JWT token with correct role and storeId from Firestore
      const payload: AuthUser = {
        sub: user.uid,
        email: user.email || '',
        uid: user.uid,
        role: (userProfile as any).role || 'cashier',
        storeId: (userProfile as any).storeId || '',
      };

      const token = this.jwtService.sign(payload);

      return {
        accessToken: token,
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${email}`, error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Fetch user profile from Firestore across all stores
   * Returns the first match found
   */
  private async getUserProfileFromFirestore(uid: string) {
    try {
      const storesSnapshot = await this.firestore.collection('stores').get();

      for (const storeDoc of storesSnapshot.docs) {
        const userDoc = await this.firestore
          .collection(this.firebaseService.getCollectionPath(storeDoc.id, 'users'))
          .doc(uid)
          .get();

        if (userDoc.exists) {
          return { ...userDoc.data(), storeId: storeDoc.id };
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${uid}`, error);
      return null;
    }
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      this.logger.debug('Token validation failed');
      return null;
    }
  }

  async getUserProfile(uid: string, storeId: string) {
    try {
      const userDoc = await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'users'))
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }

      return userDoc.data();
    } catch (error) {
      this.logger.error(`Failed to fetch user profile: ${uid}`, error);
      throw error;
    }
  }

  async logout(uid: string) {
    // In a real app, you might invalidate tokens in a blacklist
    this.logger.log(`User logged out: ${uid}`);
    return { message: 'Logged out successfully' };
  }
}
