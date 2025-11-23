const express = require('express');
const path = require('path');

// Import modules
const KeyManager = require('./KeyManager');
const CertificateStorage = require('./CertificateStorage');
const CertificateGenerator = require('./CertificateGenerator');
const CertificateVerifier = require('./CertificateVerifier');
const QRCodeGenerator = require('./QRCodeGenerator');
const PDFGenerator = require('./PDFGenerator');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Initialize modules
console.log('Initializing Certificate Signature System...');
const keyManager = new KeyManager();
const storage = new CertificateStorage();
const certificateGenerator = new CertificateGenerator(keyManager, storage);
const certificateVerifier = new CertificateVerifier(keyManager, storage);
const qrCodeGenerator = new QRCodeGenerator(BASE_URL);
const pdfGenerator = new PDFGenerator();

console.log('System initialized successfully.\n');

// Routes

// Certificate Issuance Endpoint
app.post('/api/issue', async (req, res) => {
  try {
    const { studentName, cohort } = req.body;

    // Validate inputs
    if (!studentName || !cohort) {
      return res.status(400).json({ 
        error: 'Missing required fields: studentName and cohort are required' 
      });
    }

    if (studentName.length > 100 || cohort.length > 100) {
      return res.status(400).json({ 
        error: 'Input too long: maximum 100 characters for each field' 
      });
    }

    console.log(`Generating certificate for ${studentName}, cohort: ${cohort}`);
    
    // Generate certificate
    const certificate = certificateGenerator.generateCertificate(studentName, cohort);
    console.log(`Certificate generated with ID: ${certificate.id}`);

    // Generate QR code
    console.log('Generating QR code...');
    const qrCodeDataURL = await qrCodeGenerator.generateQRCode(certificate.id);
    console.log('QR code generated successfully');

    // Create PDF
    console.log('Creating PDF...');
    const pdfBuffer = await pdfGenerator.createCertificatePDF(certificate, qrCodeDataURL);
    console.log(`PDF created, size: ${pdfBuffer.length} bytes`);

    // Save certificate to storage
    storage.saveCertificate(certificate);

    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.id}.pdf`);
    res.send(pdfBuffer);

    console.log(`Certificate issued successfully: ${certificate.id} for ${studentName}\n`);
  } catch (error) {
    console.error('Error issuing certificate:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to issue certificate', details: error.message });
  }
});

// Certificate Verification Endpoint
app.get('/api/verify/:id', (req, res) => {
  try {
    const certificateId = req.params.id;

    // Verify certificate
    const result = certificateVerifier.verifyCertificate(certificateId);

    res.json(result);

    console.log(`Verification request for ${certificateId}: ${result.message}`);
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ 
      valid: false, 
      certificate: null, 
      message: 'Server error during verification' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
  console.log(`Admin interface: ${BASE_URL}/`);
  console.log(`Verification page: ${BASE_URL}/verify.html`);
});
