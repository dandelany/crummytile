export function cheapId(): string {
  return new Date().getTime().toString(36).split('').reverse().join('');
}