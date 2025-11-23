const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

class KeyManager {
  constructor(keyPath = './keys') {
    // Default keyPath may not be writable in serverless environments (Vercel).
    // Prefer an explicit environment override, otherwise try the provided path
    // and fall back to the system temp directory if it's not writable.
    const envPath = process.env.KEY_PATH;
    let resolvedPath = envPath || keyPath;

    // If resolvedPath is not writable, use OS temp directory
    try {
      const testDir = path.resolve(resolvedPath);
      // Ensure parent exists (but avoid throwing if we can't create it)
      fs.mkdirSync(testDir, { recursive: true });
      // Try writing a tiny temp file to validate writability
      const testFile = path.join(testDir, '.writetest');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
    } catch (err) {
      // Fall back to OS temp directory when original path is not writable
      resolvedPath = path.join(os.tmpdir(), 'certificate-keys');
      fs.mkdirSync(resolvedPath, { recursive: true });
    }

    this.keyPath = resolvedPath;
    this.privateKeyPath = path.join(this.keyPath, 'private.pem');
    this.publicKeyPath = path.join(this.keyPath, 'public.pem');
    this.publicKey = null;
    this.privateKey = null;
    
    this.initialize();
  }

  initialize() {
    // Create keys directory if it doesn't exist
    if (!fs.existsSync(this.keyPath)) {
      fs.mkdirSync(this.keyPath, { recursive: true });
    }

    // Load or generate keys
    if (fs.existsSync(this.privateKeyPath) && fs.existsSync(this.publicKeyPath)) {
      this.loadKeys();
    } else {
      this.generateKeys();
    }
  }

  generateKeys() {
    console.log('Generating new RSA-2048 key pair...');
    
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Save keys to files
    fs.writeFileSync(this.privateKeyPath, privateKey);
    fs.writeFileSync(this.publicKeyPath, publicKey);
    
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    
    console.log('Keys generated and saved successfully.');
  }

  loadKeys() {
    console.log('Loading existing keys...');
    
    this.privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
    
    console.log('Keys loaded successfully.');
  }

  getPublicKey() {
    return this.publicKey;
  }

  getPrivateKey() {
    return this.privateKey;
  }
}

module.exports = KeyManager;
