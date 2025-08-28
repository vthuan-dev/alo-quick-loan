import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { VerifyFirebaseTokenDto, FirebaseLoginResponseDto } from './dto/firebase-auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async verifyFirebaseTokenAndLogin(dto: VerifyFirebaseTokenDto): Promise<FirebaseLoginResponseDto> {
    try {
      // Verify the Firebase ID token
      const decodedToken = await this.firebaseService.verifyIdToken(dto.idToken);
      
      if (!decodedToken.phone_number) {
        throw new BadRequestException('Phone number not found in Firebase token');
      }

      // Get user details from Firebase
      const firebaseUser = await this.firebaseService.getUser(decodedToken.uid);
      
      // Generate our own JWT token for API authentication
      const payload: JwtPayload = {
        phoneNumber: firebaseUser.phoneNumber!,
        sub: decodedToken.uid, // Use Firebase UID as subject
      };

      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN_SECONDS') || 86400; // 24 hours

      this.logger.log(`User ${firebaseUser.phoneNumber} logged in successfully via Firebase`);

      return {
        accessToken,
        phoneNumber: firebaseUser.phoneNumber!,
        uid: decodedToken.uid,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Firebase token has expired');
      }
      
      if (error.code === 'auth/id-token-invalid') {
        throw new UnauthorizedException('Invalid Firebase token');
      }
      
      this.logger.error('Failed to verify Firebase token:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async validateUser(uid: string): Promise<boolean> {
    try {
      const user = await this.firebaseService.getUser(uid);
      return !!user;
    } catch (error) {
      return false;
    }
  }
}
