document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('certificateForm');
  const submitBtn = document.getElementById('submitBtn');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentName = document.getElementById('studentName').value.trim();
    const cohort = document.getElementById('cohort').value.trim();

    // Validate inputs
    if (!studentName || !cohort) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating...';

    try {
      const response = await fetch('/api/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentName, cohort })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate certificate');
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Extract certificate ID from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'certificate.pdf';

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Extract certificate ID from filename
      const certId = filename.replace('certificate-', '').replace('.pdf', '');
      
      // Create a more prominent success message with copy button
      const successHTML = `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px; font-weight: 600;">✓ Certificate generated successfully!</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
            <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Certificate ID:</p>
            <p style="font-family: monospace; font-size: 14px; word-break: break-all; margin-bottom: 10px;">${certId}</p>
            <button onclick="navigator.clipboard.writeText('${certId}').then(() => alert('Certificate ID copied to clipboard!'))" 
                    style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              Copy ID
            </button>
          </div>
          <p style="font-size: 13px; color: #666;">Use this ID to verify the certificate, or scan the QR code on the PDF.</p>
        </div>
      `;
      
      messageDiv.innerHTML = successHTML;
      messageDiv.className = 'message success';
      messageDiv.classList.remove('hidden');
      
      // Reset form
      form.reset();

    } catch (error) {
      console.error('Error:', error);
      showMessage(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Generate Certificate';
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);
    }
  }
});
