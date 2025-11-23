const fs = require('fs');
const path = require('path');
const os = require('os');

class CertificateStorage {
  constructor(storagePath = './data/certificates.json') {
    this.storagePath = storagePath;
    this.initialize();
  }

  initialize() {
    try {
      // Create data directory if it doesn't exist
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create storage file if it doesn't exist
      if (!fs.existsSync(this.storagePath)) {
        const initialData = { certificates: [] };
        fs.writeFileSync(this.storagePath, JSON.stringify(initialData, null, 2));
        console.log('Certificate storage initialized.');
      }
    } catch (err) {
      // If target path is not writable (serverless), fall back to OS temp directory
      try {
        const fallbackDir = path.join(os.tmpdir(), 'certificate-data');
        fs.mkdirSync(fallbackDir, { recursive: true });
        this.storagePath = path.join(fallbackDir, 'certificates.json');
        if (!fs.existsSync(this.storagePath)) {
          const initialData = { certificates: [] };
          fs.writeFileSync(this.storagePath, JSON.stringify(initialData, null, 2));
        }
        console.warn(`CertificateStorage: fell back to temp storage at ${this.storagePath}`);
      } catch (fallbackErr) {
        console.error('CertificateStorage initialization failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  }

  saveCertificate(certificate) {
    try {
      // Read existing data
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      
      // Add new certificate
      data.certificates.push(certificate);
      
      // Write back to file
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
      
      console.log(`Certificate ${certificate.id} saved successfully.`);
    } catch (error) {
      console.error('Error saving certificate:', error);
      throw error;
    }
  }

  getCertificate(id) {
    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      const certificate = data.certificates.find(cert => cert.id === id);
      return certificate || null;
    } catch (error) {
      console.error('Error retrieving certificate:', error);
      return null;
    }
  }

  getAllCertificates() {
    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      return data.certificates;
    } catch (error) {
      console.error('Error retrieving certificates:', error);
      return [];
    }
  }
}

module.exports = CertificateStorage;
