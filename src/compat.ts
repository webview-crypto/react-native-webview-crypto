export function subtle(): SubtleCrypto {
  return window.crypto.subtle || (window.crypto as any).webkitSubtle;
}
