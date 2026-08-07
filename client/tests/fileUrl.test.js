import { describe,expect,it } from 'vitest';import { buildFileUrl } from '../src/services/fileUrl'
describe('buildFileUrl',()=>{it('resuelve uploads relativos',()=>expect(buildFileUrl('/uploads/servicios/a.webp')).toContain('/uploads/servicios/a.webp'));it('rechaza hosts externos',()=>expect(buildFileUrl('https://evil.example/a.png')).toBeNull())})
