import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetersModule } from './meters/meters.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [MetersModule, TokensModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
