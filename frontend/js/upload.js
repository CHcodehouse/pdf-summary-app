let selectedFile = null;

// File upload handling
document.getElementById('upload-area').addEventListener('click', () => {
  document.getElementById('pdf-file').click();
});

document.getElementById('pdf-file').addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedFile = e.target.files[0];
    document.getElementById('file-name').textContent = selectedFile.name;
    document.getElementById('file-info').classList.remove('hidden');
    document.getElementById('summary-options').classList.remove('hidden');
  }
});

// Drag and drop
document.getElementById('upload-area').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
});

document.getElementById('upload-area').addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
});

document.getElementById('upload-area').addEventListener('drop', (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  
  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file.type === 'application/pdf') {
      selectedFile = file;
      document.getElementById('file-name').textContent = selectedFile.name;
      document.getElementById('file-info').classList.remove('hidden');
      document.getElementById('summary-options').classList.remove('hidden');
    } else {
      alert('Please upload a PDF file');
    }
  }
});

async function uploadPDF() {
  if (!selectedFile || !currentUser) return;

  const detailed = document.querySelector('input[name="summary-type"]:checked').value === 'detailed';
  const formData = new FormData();
  formData.append('pdf', selectedFile);
  formData.append('detailed', detailed);

  try {
    const token = await currentUser.getIdToken();
    const response = await fetch('/api/summary/summarize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        showSubscriptionModal();
      }
      throw new Error(data.error);
    }

    // Display results
    document.getElementById('summary-content').textContent = data.summary;
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('upload-section').classList.add('hidden');
    
    // Update usage
    checkUsage();

  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function resetApp() {
  selectedFile = null;
  document.getElementById('pdf-file').value = '';
  document.getElementById('file-info').classList.add('hidden');
  document.getElementById('summary-options').classList.add('hidden');
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('upload-section').classList.remove('hidden');
}