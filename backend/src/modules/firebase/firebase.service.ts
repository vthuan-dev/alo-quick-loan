import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Initialize Firebase Admin SDK
      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      
      if (serviceAccountPath) {
        try {
          // Initialize with service account file
          const path = require('path');
          const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
          this.logger.log(`Loading Firebase service account from: ${absolutePath}`);
          const serviceAccount = require(absolutePath);
          this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.logger.log('Firebase Admin SDK initialized successfully');
        } catch (error) {
          this.logger.error('Error loading Firebase service account:', error.message);
          this.logger.warn('Firebase service account file not found. Firebase authentication will not be available.');
          this.logger.warn('Please download the service account JSON from Firebase Console and save it as firebase-service-account.json');
          return;
        }
      } else {
        // Initialize with environment variables
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
          this.logger.warn('Firebase configuration is missing. Firebase authentication will not be available.');
          this.logger.warn('Please configure Firebase credentials in your .env file');
          return;
        }

        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.logger.warn('Firebase authentication will not be available');
    }
  }
  getAuth(): admin.auth.Auth {
    if (!this.app) {
      throw new Error('Firebase is not initialized. Please configure Firebase credentials.');
    }
    return admin.auth(this.app);
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Failed to verify Firebase ID token:', error);
      throw error;
    }
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUser(uid);
    } catch (error) {
      this.logger.error(`Failed to get user ${uid}:`, error);
      throw error;
    }
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<admin.auth.UserRecord | null> {
    try {
      return await this.getAuth().getUserByPhoneNumber(phoneNumber);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      this.logger.error(`Failed to get user by phone ${phoneNumber}:`, error);
      throw error;
    }
  }

  async createCustomToken(uid: string, claims?: object): Promise<string> {
    try {
      return await this.getAuth().createCustomToken(uid, claims);
    } catch (error) {
      this.logger.error(`Failed to create custom token for ${uid}:`, error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.getAuth().deleteUser(uid);
    } catch (error) {
      this.logger.error(`Failed to delete user ${uid}:`, error);
      throw error;
    }
  }
}
