import "./instrumentation";
import helmet from "@fastify/helmet";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { config as loadEnvironment } from "dotenv";
import { resolve } from "node:path";

// AppModule will be dynamically imported after dotenv loads

const workspaceRoot = resolve(__dirname, "../../..");
loadEnvironment({
  path: [resolve(workspaceRoot, ".env.local"), resolve(workspaceRoot, ".env")],
  quiet: true,
});

async function bootstrap(): Promise<void> {
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  const configuredOrigins = (process.env.WEB_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      const isLocalDevelopment =
        process.env.NODE_ENV !== "production" &&
        (!origin || /^http:\/\/(localhost|127\.0\.0\.1):30\d{2}$/.test(origin));
      const isConfigured = Boolean(origin && configuredOrigins.includes(origin));
      callback(null, isLocalDevelopment || isConfigured);
    },
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix("api/v1");

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  Logger.log(`RAMA API listening on http://localhost:${port}/api/v1`, "Bootstrap");
}

void bootstrap();


