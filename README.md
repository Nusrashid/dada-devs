# Certificate Signature System

A digital certificate signature and verification system for Bitcoin Dada & DadaDevs. This MVP provides tamper-proof digital certificates with QR code verification.

## Features

✅ **Unique Certificate IDs** - UUID v4 generation for each certificate  
✅ **Digital Signatures** - RSA-2048 with SHA-256 for tamper-proof certificates  
✅ **QR Code Verification** - Easy scanning to verify authenticity  
✅ **Simple Admin Interface** - Non-technical team members can issue certificates  
✅ **Automatic PDF Generation** - Professional certificate PDFs with embedded signatures  
✅ **Forgery Prevention** - Cryptographic signatures detect any tampering  

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Usage

### Issuing Certificates

1. Open your browser and navigate to `http://localhost:3000`
2. Fill in the certificate form:
   - **Student Name**: Full name of the student
   - **Cohort**: Cohort identifier (e.g., "2024-Q1")
3. Click "Generate Certificate"
4. The PDF certificate will automatically download to your computer

### Verifying Certificates

**Method 1: QR Code (Recommended)**
1. Open the certificate PDF
2. Scan the QR code with your phone camera
3. The verification page will open automatically showing certificate details

**Method 2: Manual URL**
1. Navigate to `http://localhost:3000/verify.html?id=CERTIFICATE_ID`
2. Replace `CERTIFICATE_ID` with the actual certificate ID
3. View the verification results

### Verification Results

- **✓ Green Check**: Certificate is authentic and unmodified
- **⚠ Yellow Warning**: Certificate has been tampered with
- **✗ Red X**: Certificate not found in the system

## Security

### Private Key Protection

- Private keys are stored in the `./keys/` directory
- This directory is excluded from version control via `.gitignore`
- **IMPORTANT**: Never commit or share your private key files
- Backup your keys securely - losing them means you cannot verify existing certificates

### How It Works

1. **Certificate Generation**:
   - System generates a unique UUID for the certificate
   - Creates a canonical string from certificate data
   - Signs the string using RSA-2048 private key with SHA-256 hashing
   - Embeds signature and QR code in PDF

2. **Verification**:
   - Retrieves certificate data from storage
   - Reconstructs the canonical string
   - Verifies signature using RSA-2048 public key
   - Reports if certificate is authentic or tampered

3. **Tamper Detection**:
   - Any modification to certificate data invalidates the signature
   - Verification will fail if data doesn't match the signature
   - Fake certificate IDs will return "not found"

## Configuration

### Environment Variables

You can customize the server using environment variables:

```bash
PORT=3000                                    # Server port
BASE_URL=http://localhost:3000              # Base URL for QR codes
```

### Production Deployment

For production use:

1. Set `BASE_URL` to your production domain:
```bash
BASE_URL=https://certificates.bitcoindada.com npm start
```

2. Use HTTPS for secure verification URLs

3. Set up proper file permissions for the `keys/` directory

4. Implement regular backups of:
   - `keys/` directory (private and public keys)
   - `data/certificates.json` (certificate database)

## File Structure

```
certificate-signature-system/
├── src/
│   ├── server.js                 # Express server and routes
│   ├── KeyManager.js             # RSA key generation and management
│   ├── CertificateStorage.js     # JSON-based certificate storage
│   ├── CertificateGenerator.js   # Certificate creation and signing
│   ├── CertificateVerifier.js    # Signature verification
│   ├── QRCodeGenerator.js        # QR code generation
│   └── PDFGenerator.js           # PDF certificate creation
├── public/
│   ├── index.html                # Admin interface
│   ├── verify.html               # Verification page
│   ├── css/styles.css            # Styling
│   └── js/
│       ├── admin.js              # Admin interface logic
│       └── verify.js             # Verification page logic
├── keys/                         # RSA keys (auto-generated, gitignored)
├── data/                         # Certificate storage (auto-generated)
├── package.json
└── README.md
```

## Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port: `PORT=8080 npm start`

### Certificate download fails
- Check browser console for errors
- Ensure all form fields are filled
- Verify server is running

### Verification shows "Certificate not found"
- Ensure the certificate was successfully issued
- Check that the certificate ID is correct
- Verify `data/certificates.json` exists and contains data

### Keys not generating
- Check file system permissions
- Ensure `keys/` directory can be created
- Check server logs for error messages

## Technical Details

- **Cryptography**: RSA-2048 with SHA-256
- **Certificate ID**: UUID v4
- **Storage**: JSON file-based
- **PDF Library**: PDFKit
- **QR Code Library**: qrcode
- **Server**: Express.js

## Future Enhancements

Potential features for future versions:
- Certificate revocation system
- Dashboard to view all issued certificates
- Bulk certificate generation
- Upload certificate PDF for verification
- OpenTimestamps blockchain anchoring
- Email delivery of certificates
- Custom certificate templates
- Multi-language support

## License

MIT

## Support

For issues or questions, contact Bitcoin Dada & DadaDevs.
