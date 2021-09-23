export default function getCode(): string {
  return makeId(5);
}

function makeId(length: number): string {
  let result = ''
  const characters =
    'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
