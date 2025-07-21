module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173',
        'http://localhost:4173/login',
        'http://localhost:4173/register',
        'http://localhost:4173/startups',
        'http://localhost:4173/search'
      ],
      startServerCommand: 'cd frontend && npm ci && npm run build && npm run preview -- --port 4173 --host 0.0.0.0',
      startServerReadyPattern: 'Local.*4173',
      startServerReadyTimeout: 60000,
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: './.lighthouseci'
    }
  }
};