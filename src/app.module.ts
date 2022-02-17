import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetersModule } from './meters/meter.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [MetersModule, TokensModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
