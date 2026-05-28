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
      // In production, use Firebase REST API or Admin SDK custom token
      // For MVP, we'll use JWT with Firebase email verification
      const user = await this.firebaseService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload: AuthUser = {
        sub: user.uid,
        email: user.email || '',
        uid: user.uid,
        role: 'cashier', // Default role, should be fetched from Firestore
        storeId: '', // Should be fetched from Firestore
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
