import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { QueueService } from './queue.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.redisUrl.split(':')[0].replace('redis://', ''),
          port: parseInt(configService.redisUrl.split(':')[1] || '6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
