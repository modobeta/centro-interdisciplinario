process.env.NODE_ENV = 'test';
process.env.RUN_DATABASE_TESTS ||= process.env.TEST_DATABASE_URL ? 'true' : 'false';
process.env.TEST_DATABASE_URL ||= 'postgres://test:test@localhost:5432/centro_interdisciplinario_test';
process.env.JWT_ACCESS_SECRET ||= 'test-secret-with-at-least-thirty-two-characters';
process.env.CORS_ORIGINS ||= 'http://localhost:5173';
process.env.LOG_LEVEL ||= 'silent';
