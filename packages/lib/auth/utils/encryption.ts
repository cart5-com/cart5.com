import { decodeBase64, encodeBase64 } from "@oslojs/encoding";  // Make sure encodeBase64 is imported
import { createCipheriv, createDecipheriv } from "crypto";
import { DynamicBuffer } from "@oslojs/binary";

export function encryptAesGcm(
	data: Uint8Array,
	ENCRYPTION_KEY_STRING: string): Uint8Array {
	const ENCRYPTION_KEY = decodeBase64(ENCRYPTION_KEY_STRING);
	const iv = new Uint8Array(16);
	crypto.getRandomValues(iv);
	const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
	const encrypted = new DynamicBuffer(0);
	encrypted.write(iv);
	encrypted.write(cipher.update(data));
	encrypted.write(cipher.final());
	encrypted.write(cipher.getAuthTag());
	return encrypted.bytes();
}

export function encryptString(data: string, ENCRYPTION_KEY_STRING: string): Uint8Array {
	return encryptAesGcm(new TextEncoder().encode(data), ENCRYPTION_KEY_STRING);
}

export function decryptAesGcm(encrypted: Uint8Array, ENCRYPTION_KEY_STRING: string): Uint8Array {
	if (encrypted.byteLength < 33) {
		throw new Error("Invalid data");
	}
	const ENCRYPTION_KEY = decodeBase64(ENCRYPTION_KEY_STRING);
	const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, encrypted.slice(0, 16));
	decipher.setAuthTag(encrypted.slice(encrypted.byteLength - 16));
	const decrypted = new DynamicBuffer(0);
	decrypted.write(decipher.update(encrypted.slice(16, encrypted.byteLength - 16)));
	decrypted.write(decipher.final());
	return decrypted.bytes();
}

export function decryptToString(data: Uint8Array, ENCRYPTION_KEY_STRING: string): string {
	return new TextDecoder().decode(decryptAesGcm(data, ENCRYPTION_KEY_STRING));
}

export function encrypt(data: string, ENCRYPTION_KEY_STRING: string): string {
	const encrypted = encryptString(data, ENCRYPTION_KEY_STRING);
	return encodeBase64(encrypted);
}

export function decrypt(data: string, ENCRYPTION_KEY_STRING: string): string {
	const encryptedBytes = decodeBase64(data);
	return decryptToString(encryptedBytes, ENCRYPTION_KEY_STRING);
}
