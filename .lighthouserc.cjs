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
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off'
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