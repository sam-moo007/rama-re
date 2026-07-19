import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const traceExporter = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? new OTLPTraceExporter()
  : undefined;

const sdk = new NodeSDK({
  ...(traceExporter ? { traceExporter } : {}),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'rama-api',
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
