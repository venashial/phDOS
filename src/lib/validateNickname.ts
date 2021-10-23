export default function validateNickname(nickname: string): boolean {
  return nickname.length > 0 && nickname.length < 16
  //return /^[a-zA-Z0-9_]{1,16}$/.test(nickname);
}