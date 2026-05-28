import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: FirebaseService;
  let jwtService: JwtService;

  const mockFirebaseService = {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    verifyPassword: jest.fn(),
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ role: 'cashier', storeId: 'store-123' })
          }),
        }),
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: 'store-123',
            },
          ],
        }),
      }),
    }),
    getCollectionPath: jest.fn((storeId, collection) => `stores/${storeId}/${collection}`),
  };

  const mockJwtService = {
    sign: jest.fn((payload) => 'mock-token'),
    verify: jest.fn((token) => ({ sub: 'uid', email: 'test@example.com' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'cashier',
        storeId: 'store-123',
      };

      mockFirebaseService.getUserByEmail.mockResolvedValue(null);
      mockFirebaseService.createUser.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('test@example.com');
      expect(mockFirebaseService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User',
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'cashier',
        storeId: 'store-123',
      };

      mockFirebaseService.getUserByEmail.mockResolvedValue({
        uid: 'user-123',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user and return token with correct role and storeId', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFirebaseService.getUserByEmail.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      mockFirebaseService.verifyPassword.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'cashier',
          storeId: 'store-123',
        })
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      mockFirebaseService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockFirebaseService.getUserByEmail.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      mockFirebaseService.verifyPassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate and return token payload', async () => {
      const token = 'valid-token';
      const result = await service.validateToken(token);

      expect(result).toHaveProperty('sub');
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return null for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});
