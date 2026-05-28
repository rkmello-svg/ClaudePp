import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);

  console.log(`✅ Backend rodando em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar backend:', err);
  process.exit(1);
});
