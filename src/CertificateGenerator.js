const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class CertificateGenerator {
  constructor(keyManager, storage) {
    this.keyManager = keyManager;
    this.storage = storage;
  }

  generateCertificateId() {
    return uuidv4();
  }

  createCanonicalString(certificate) {
    // Create a canonical representation of certificate data for signing
    return `${certificate.id}|${certificate.studentName}|${certificate.cohort}|${certificate.issueDate}`;
  }

  createSignature(certificate) {
    const canonicalString = this.createCanonicalString(certificate);
    const privateKey = this.keyManager.getPrivateKey();
    
    // Create signature using RSA-SHA256
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(canonicalString);
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    return signature;
  }

  generateCertificate(studentName, cohort) {
    // Create certificate object
    const certificate = {
      id: this.generateCertificateId(),
      studentName: studentName,
      cohort: cohort,
      issueDate: new Date().toISOString(),
      issuer: 'Bitcoin Dada & DadaDevs',
      signature: ''
    };

    // Generate signature
    certificate.signature = this.createSignature(certificate);

    return certificate;
  }
}

module.exports = CertificateGenerator;
