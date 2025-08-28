import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI') || 
    `mongodb://${configService.get<string>('DB_HOST')}:${configService.get<number>('DB_PORT')}/${configService.get<string>('DB_DATABASE')}`;
  
  return {
    uri,
    // Additional options for production
    ...(configService.get<string>('NODE_ENV') === 'production' && {
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
    }),
  };
};
