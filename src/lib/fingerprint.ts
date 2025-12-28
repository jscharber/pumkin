import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getVisitorId(): Promise<string> {
  try {
    // Layer 1: Browser fingerprint
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprintId = result.visitorId;

    // Layer 2: Persistent cookie/localStorage
    let cookieId = localStorage.getItem('voter_id');
    if (!cookieId) {
      cookieId = crypto.randomUUID();
      localStorage.setItem('voter_id', cookieId);
      document.cookie = `voter_id=${cookieId}; max-age=31536000; path=/; SameSite=Strict`;
    }

    // Layer 3: IP address (from Netlify function)
    let ip = 'unknown';
    try {
      const ipResponse = await fetch('/.netlify/functions/get-ip');
      if (ipResponse.ok) {
        const data = await ipResponse.json();
        ip = data.ip;
      }
    } catch (error) {
      console.warn('Failed to get IP address:', error);
    }

    // Combine and hash
    const combined = `${fingerprintId}_${cookieId}_${ip}`;
    const hash = await sha256(combined);

    return hash.substring(0, 32);
  } catch (error) {
    console.error('Error generating visitor ID:', error);
    // Fallback to just cookie-based ID
    let cookieId = localStorage.getItem('voter_id');
    if (!cookieId) {
      cookieId = crypto.randomUUID();
      localStorage.setItem('voter_id', cookieId);
    }
    return await sha256(cookieId);
  }
}
