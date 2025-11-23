const QRCode = require('qrcode');

class QRCodeGenerator {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async generateQRCode(certificateId) {
    const verificationURL = `${this.baseURL}/verify.html?id=${certificateId}`;
    
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(verificationURL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

module.exports = QRCodeGenerator;
