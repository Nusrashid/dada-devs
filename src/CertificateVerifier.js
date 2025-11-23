const crypto = require('crypto');

class CertificateVerifier {
  constructor(keyManager, storage) {
    this.keyManager = keyManager;
    this.storage = storage;
  }

  createCanonicalString(certificate) {
    // Must match the canonical string format used in CertificateGenerator
    return `${certificate.id}|${certificate.studentName}|${certificate.cohort}|${certificate.issueDate}`;
  }

  verifyCertificate(certificateId) {
    // Retrieve certificate from storage
    const certificate = this.storage.getCertificate(certificateId);

    if (!certificate) {
      return {
        valid: false,
        certificate: null,
        message: 'Certificate not found'
      };
    }

    try {
      // Reconstruct canonical string
      const canonicalString = this.createCanonicalString(certificate);
      const publicKey = this.keyManager.getPublicKey();

      // Verify signature
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(canonicalString);
      verify.end();

      const isValid = verify.verify(publicKey, certificate.signature, 'base64');

      if (isValid) {
        return {
          valid: true,
          certificate: certificate,
          message: 'Certificate is authentic'
        };
      } else {
        return {
          valid: false,
          certificate: certificate,
          message: 'Certificate has been tampered with'
        };
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        valid: false,
        certificate: certificate,
        message: 'Verification error occurred'
      };
    }
  }
}

module.exports = CertificateVerifier;
