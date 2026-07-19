export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = require('@vercel/otel');
    registerOTel({ serviceName: 'rama-web' });
  }
}
