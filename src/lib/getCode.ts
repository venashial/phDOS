import { rooms } from '../db.ts'

export default async function getCode(): Promise<string> {
  let newCode = ''
  for (let i = 0; i < 6000; i++) {
    const generatedCode = makeId(5)
    if (!(await rooms.findOne({ code: generatedCode }))) {
      newCode = generatedCode;
      break
    }
  }

  if (newCode) {
    return newCode
  } else {
    throw new Error('Unable to generate code')
  }
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
