import { registerAs } from '@nestjs/config';

export const ElasticsearchConfig = registerAs('elasticsearch', () => ({
  node: `${process.env.ELASTICSEARCH_PROTOCOL || 'http'}://${process.env.ELASTICSEARCH_HOST || 'localhost'}:${process.env.ELASTICSEARCH_PORT || 9200}`,
  auth: process.env.NODE_ENV === 'production' ? {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  } : undefined,
  tls: process.env.NODE_ENV === 'production' ? {
    ca: process.env.ELASTICSEARCH_CA_CERT,
    rejectUnauthorized: process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED !== 'false',
  } : undefined,
  requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
  pingTimeout: parseInt(process.env.ELASTICSEARCH_PING_TIMEOUT || '3000'),
  sniffOnStart: process.env.ELASTICSEARCH_SNIFF_ON_START === 'true',
  sniffInterval: process.env.ELASTICSEARCH_SNIFF_INTERVAL ? parseInt(process.env.ELASTICSEARCH_SNIFF_INTERVAL) : false,
  sniffOnConnectionFault: process.env.ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT === 'true',
  compression: 'gzip',
  maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.ELASTICSEARCH_RETRY_DELAY || '1000'),
}));