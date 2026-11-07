import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
if (typeof window !== 'undefined') {
Object.defineProperty(window, 'matchMedia', { value: vi.fn().mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
}
// Os testes não consultam provedores reais. As respostas abaixo são fixtures explícitas.
vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(url.includes('/status') ? [] : { items: [], statuses: [] }), { status: 200 })));

