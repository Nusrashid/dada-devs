const PDFDocument = require('pdfkit');

class PDFGenerator {
  constructor() {}

  createCertificatePDF(certificate, qrCodeDataURL) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];

        // Collect PDF data
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          console.log('PDF generation completed successfully');
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', (err) => {
          console.error('PDF generation error:', err);
          reject(err);
        });

        // Header
        doc.fontSize(28)
           .font('Helvetica-Bold')
           .text('BITCOIN DADA & DADADEVS', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(22)
           .font('Helvetica')
           .text('Certificate of Completion', { align: 'center' })
           .moveDown(2);

        // Student Name
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(certificate.studentName, { align: 'center' })
           .moveDown(1.5);

        // Cohort and Date
        doc.fontSize(16)
           .font('Helvetica')
           .text(`Cohort: ${certificate.cohort}`, { align: 'center' })
           .moveDown(0.5);

        const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Issue Date: ${issueDate}`, { align: 'center' })
           .moveDown(2);

        // QR Code
        if (qrCodeDataURL) {
          try {
            const qrImageBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
            const xPosition = doc.page.width / 2 - 75;
            const yPosition = doc.y;
            doc.image(qrImageBuffer, xPosition, yPosition, { width: 150, height: 150 });
            doc.moveDown(10);
          } catch (qrError) {
            console.error('Error embedding QR code:', qrError);
            doc.moveDown(2);
          }
        }

        // Certificate ID and Signature
        doc.fontSize(10)
           .fillColor('#000000')
           .font('Helvetica')
           .text(`Certificate ID: ${certificate.id}`, { align: 'center' })
           .moveDown(0.3);

        const signaturePreview = certificate.signature.substring(0, 32) + '...';
        doc.fontSize(9)
           .text(`Digital Signature: ${signaturePreview}`, { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(8)
           .fillColor('#666666')
           .text('Scan QR code to verify authenticity', { align: 'center' });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;
