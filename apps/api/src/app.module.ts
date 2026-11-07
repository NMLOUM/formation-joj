import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { PlacesModule } from './modules/places/places.module';

@Module({
  imports: [CoreModule, PlacesModule],
})
export class AppModule {}
