export default function validateNickname(nickname: string): boolean {
  return /^[a-zA-Z0-9_]{1,16}$/.test(nickname);
}