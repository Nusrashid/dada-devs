const path = require('path');
const os = require('os');

const KeyManager = require('../../src/KeyManager');
const CertificateStorage = require('../../src/CertificateStorage');
const CertificateVerifier = require('../../src/CertificateVerifier');

// Use writable temp locations in serverless environments
const tmpDir = process.env.RUNNER_TEMP || os.tmpdir();
const keysPath = path.join(tmpDir, 'certificate-keys');
const storagePath = path.join(tmpDir, 'certificates.json');

module.exports = (req, res) => {
  try {
    // Vercel dynamic routes expose params via req.query
    const certificateId = (req.query && (req.query.id || req.query.id)) || null;

    if (!certificateId) {
      return res.status(400).json({ valid: false, certificate: null, message: 'Missing certificate id' });
    }

    const keyManager = new KeyManager(keysPath);
    const storage = new CertificateStorage(storagePath);
    const certificateVerifier = new CertificateVerifier(keyManager, storage);

    const result = certificateVerifier.verifyCertificate(certificateId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Verify API error:', error);
    return res.status(500).json({ valid: false, certificate: null, message: 'Server error during verification' });
  }
};
