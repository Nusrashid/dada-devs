document.addEventListener('DOMContentLoaded', async () => {
  const manualInputDiv = document.getElementById('manualInput');
  const loadingDiv = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const statusIndicator = document.getElementById('statusIndicator');
  const certificateDetails = document.getElementById('certificateDetails');
  const errorMessage = document.getElementById('errorMessage');
  const verifyForm = document.getElementById('verifyForm');

  // Get certificate ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const certificateId = urlParams.get('id');

  // If no ID in URL, show manual input form
  if (!certificateId) {
    manualInputDiv.classList.remove('hidden');
    
    // Handle manual form submission
    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputId = document.getElementById('certificateIdInput').value.trim();
      if (inputId) {
        // Redirect to verification page with ID
        window.location.href = `/verify.html?id=${encodeURIComponent(inputId)}`;
      }
    });
    
    return;
  }

  // Hide manual input if ID is provided
  manualInputDiv.classList.add('hidden');

  try {
    // Call verification API
    const response = await fetch(`/api/verify/${certificateId}`);
    const result = await response.json();

    // Hide loading
    loadingDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    if (result.valid) {
      // Show success
      statusIndicator.className = 'status-indicator success';
      statusIndicator.innerHTML = `
        <div class="status-icon">✓</div>
        <h3>Certificate is Authentic</h3>
        <p>${result.message}</p>
      `;

      // Show certificate details
      certificateDetails.classList.remove('hidden');
      document.getElementById('studentName').textContent = result.certificate.studentName;
      document.getElementById('cohort').textContent = result.certificate.cohort;
      
      const issueDate = new Date(result.certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      document.getElementById('issueDate').textContent = issueDate;
      document.getElementById('certificateId').textContent = result.certificate.id;
      document.getElementById('issuer').textContent = result.certificate.issuer;

    } else {
      // Show failure
      statusIndicator.className = 'status-indicator failure';
      
      if (result.message === 'Certificate not found') {
        statusIndicator.innerHTML = `
          <div class="status-icon">✗</div>
          <h3>Certificate Not Found</h3>
          <p>This certificate ID does not exist in our system.</p>
        `;
      } else {
        statusIndicator.innerHTML = `
          <div class="status-icon">⚠</div>
          <h3>Certificate Invalid</h3>
          <p>${result.message}</p>
        `;
        
        // Show certificate details even if tampered
        if (result.certificate) {
          certificateDetails.classList.remove('hidden');
          document.getElementById('studentName').textContent = result.certificate.studentName;
          document.getElementById('cohort').textContent = result.certificate.cohort;
          
          const issueDate = new Date(result.certificate.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          document.getElementById('issueDate').textContent = issueDate;
          document.getElementById('certificateId').textContent = result.certificate.id;
          document.getElementById('issuer').textContent = result.certificate.issuer;
        }
      }
    }

  } catch (error) {
    console.error('Verification error:', error);
    showError('An error occurred during verification. Please try again.');
  }

  function showError(message) {
    loadingDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    statusIndicator.className = 'status-indicator failure';
    statusIndicator.innerHTML = `
      <div class="status-icon">✗</div>
      <h3>Error</h3>
      <p>${message}</p>
    `;
  }
});
