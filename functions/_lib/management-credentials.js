const PASSWORD_ITERATIONS = 600000;
const MIN_ACCEPTED_PASSWORD_ITERATIONS = 100000;
const MAX_ACCEPTED_PASSWORD_ITERATIONS = 2000000;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const TEMPORARY_PASSWORD_TTL_HOURS = 24;
const SESSION_COOKIE = '__Host-med-nykuto-management';
const CSRF_COOKIE = '__Host-med-nykuto-management-csrf';
const FAKE_PASSWORD_SALT = '8a624f9a135cfd1d9d2d926959413640';

const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(value) {
  const source = String(value || '');
  if (!/^(?:[a-f0-9]{2})+$/i.test(source)) throw new Error('invalid_hex');
  const bytes = new Uint8Array(source.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(source.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

function safeEqualHex(left, right) {
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  let mismatch = leftBytes.length ^ rightBytes.length;
  const size = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < size; index += 1) {
    mismatch |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return mismatch === 0;
}

export function normalizeEmail(value) {
  const email = String(value || '').trim().normalize('NFKC').toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
  return email;
}

export function temporaryPasswordProblem(password) {
  if (typeof password !== 'string') return 'La contraseña temporal no es válida.';
  const size = encoder.encode(password).byteLength;
  if (password.length < 6 || password.length > 128 || size > 1024) return 'La contraseña temporal debe tener entre 6 y 128 caracteres.';
  if (!/\S/.test(password) || new Set(password).size < 2) return 'La contraseña temporal es demasiado fácil de adivinar.';
  return '';
}

export function strongPasswordProblem(password) {
  if (typeof password !== 'string') return 'La nueva contraseña no es válida.';
  const size = encoder.encode(password).byteLength;
  if (password.length < 12 || password.length > 128 || size > 1024) return 'Usa entre 12 y 128 caracteres.';
  if (!/\S/.test(password) || new Set(password).size < 4 || /^[\d\s]+$/.test(password)) return 'Usa una frase difícil de adivinar, no solo números ni caracteres repetidos.';
  return '';
}

export function randomToken(bytes = 32) {
  if (!Number.isInteger(bytes) || bytes < 16 || bytes > 64) throw new Error('invalid_token_size');
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return bytesToHex(value);
}

export function isRandomToken(value, bytes = 32) {
  return typeof value === 'string' && value.length === bytes * 2 && /^(?:[a-f0-9]{2})+$/i.test(value);
}

export async function derivePasswordHash(password, salt, iterations = PASSWORD_ITERATIONS) {
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > MAX_ACCEPTED_PASSWORD_ITERATIONS) throw new Error('invalid_password_iterations');
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(salt), iterations }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

export async function createPasswordVerifier(password, iterations = PASSWORD_ITERATIONS) {
  if (typeof password !== 'string') throw new Error('invalid_password');
  const salt = randomToken(16);
  return { salt, hash: await derivePasswordHash(password, salt, iterations), iterations };
}

export async function verifyPassword(password, credential) {
  const iterations = Number(credential?.password_iterations);
  const validCredential = Boolean(
    credential
    && credential.password_algorithm === 'pbkdf2-sha256'
    && Number.isSafeInteger(Number(credential.password_version))
    && Number(credential.password_version) >= 1
    && Number.isSafeInteger(iterations)
    && iterations >= MIN_ACCEPTED_PASSWORD_ITERATIONS
    && iterations <= MAX_ACCEPTED_PASSWORD_ITERATIONS
    && /^[a-f0-9]{32}$/i.test(String(credential.password_salt || ''))
    && /^[a-f0-9]{64}$/i.test(String(credential.password_hash || ''))
  );
  const salt = validCredential ? String(credential.password_salt).toLowerCase() : FAKE_PASSWORD_SALT;
  const expected = validCredential ? String(credential.password_hash).toLowerCase() : '0'.repeat(64);
  const actual = await derivePasswordHash(typeof password === 'string' ? password : '', salt, validCredential ? iterations : PASSWORD_ITERATIONS);
  return validCredential && safeEqualHex(actual, expected);
}

export function passwordIterations() { return PASSWORD_ITERATIONS; }
export function sessionTtlSeconds() { return SESSION_TTL_SECONDS; }
export function temporaryPasswordTtlHours() { return TEMPORARY_PASSWORD_TTL_HOURS; }
export function sessionCookieName() { return SESSION_COOKIE; }
export function csrfCookieName() { return CSRF_COOKIE; }

export function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(separator + 1).trim()); } catch { return ''; }
  }
  return '';
}

export function sessionCookies(sessionToken, csrfToken, expiresAt) {
  const expires = new Date(expiresAt).toUTCString();
  const maxAge = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000));
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; Expires=${expires}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`,
    `${CSRF_COOKIE}=${encodeURIComponent(csrfToken)}; Path=/; Expires=${expires}; Max-Age=${maxAge}; Secure; SameSite=Strict`
  ];
}

export function clearSessionCookies() {
  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
  return [
    `${SESSION_COOKIE}=; Path=/; Expires=${expired}; Max-Age=0; Secure; HttpOnly; SameSite=Strict`,
    `${CSRF_COOKIE}=; Path=/; Expires=${expired}; Max-Age=0; Secure; SameSite=Strict`
  ];
}
