import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { BoardModule } from './board/board.module';
import { ListModule } from './list/list.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [UserModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule, OrganizationModule, BoardModule, ListModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
