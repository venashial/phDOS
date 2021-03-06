export default function generateSecret(): string {
  const arr = new Uint8Array(16)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, (dec) => dec.toString(16).padStart(2, '0')).join('')
}