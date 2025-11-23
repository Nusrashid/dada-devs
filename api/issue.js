const path = require('path');
const os = require('os');

const KeyManager = require('../src/KeyManager');
const CertificateStorage = require('../src/CertificateStorage');
const CertificateGenerator = require('../src/CertificateGenerator');
const QRCodeGenerator = require('../src/QRCodeGenerator');
const PDFGenerator = require('../src/PDFGenerator');

// Use writable temp locations in serverless environments
const tmpDir = process.env.RUNNER_TEMP || os.tmpdir();
const keysPath = path.join(tmpDir, 'certificate-keys');
const storagePath = path.join(tmpDir, 'certificates.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { studentName, cohort } = req.body || {};

    if (!studentName || !cohort) {
      return res.status(400).json({ error: 'Missing required fields: studentName and cohort' });
    }

    if (studentName.length > 100 || cohort.length > 100) {
      return res.status(400).json({ error: 'Input too long: max 100 characters' });
    }

    // Initialize components using safe paths
    const keyManager = new KeyManager(keysPath);
    const storage = new CertificateStorage(storagePath);
    const certificateGenerator = new CertificateGenerator(keyManager, storage);
    const qrCodeGenerator = new QRCodeGenerator(process.env.BASE_URL || `https://your-deployment-url`);
    const pdfGenerator = new PDFGenerator();

    const certificate = certificateGenerator.generateCertificate(studentName, cohort);

    const qrCodeDataURL = await qrCodeGenerator.generateQRCode(certificate.id);
    const pdfBuffer = await pdfGenerator.createCertificatePDF(certificate, qrCodeDataURL);

    // Save certificate (note: in serverless env storage may be ephemeral)
    storage.saveCertificate(certificate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Issue API error:', error);
    return res.status(500).json({ error: 'Failed to issue certificate', details: error.message });
  }
};
