import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); vi.restoreAllMocks() })
afterAll(() => server.close())
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
