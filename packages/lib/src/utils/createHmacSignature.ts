export async function createHmacSignature(message: string, key: string): Promise<string> {
    // Convert the key string to a Uint8Array
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Sign the message
    const messageData = encoder.encode(message);
    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );

    // Convert the signature to hex
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
