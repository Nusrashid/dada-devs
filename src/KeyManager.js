const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class KeyManager {
  constructor(keyPath = './keys') {
    this.keyPath = keyPath;
    this.privateKeyPath = path.join(keyPath, 'private.pem');
    this.publicKeyPath = path.join(keyPath, 'public.pem');
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
