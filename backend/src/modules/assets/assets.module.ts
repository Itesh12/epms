import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { AssetRequest, AssetRequestSchema } from './schemas/asset-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: AssetRequest.name, schema: AssetRequestSchema },
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
