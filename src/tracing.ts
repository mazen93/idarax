// eslint-disable-next-line @typescript-eslint/no-var-requires
const { NodeSDK } = require('@opentelemetry/sdk-node');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resourceFromAttributes } = require('@opentelemetry/resources');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'idarax-backend',
});

export const otelSDK = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => logger.log('SDK shut down successfully'),
      (err: any) => logger.error('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
