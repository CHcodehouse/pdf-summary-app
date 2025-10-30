const pdf = require('pdf-parse');
const { generateSummary } = require('../utils/summarizer');

const summarizePDF = async (req, res) => {
  console.log('=== PDF UPLOAD STARTED ===');
  
  try {
    // Check if file exists
    if (!req.file) {
      console.log('❌ No file received in request');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('✅ File received:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    // Simple text extraction test
    console.log('🔍 Attempting to extract text from PDF...');
    
    const data = await pdf(req.file.buffer);
    const text = data.text || '';
    
    console.log('✅ PDF parsed successfully');
    console.log('📝 Extracted text length:', text.length);
    
    if (text.length < 10) {
      console.log('❌ Very little text extracted - PDF might be scanned images');
      return res.status(400).json({ 
        error: 'This PDF appears to be scanned images or has no selectable text. Please use a PDF with readable text.' 
      });
    }

    console.log('📖 Sample of extracted text:', text.substring(0, 200) + '...');

    // Generate simple summary
    const detailed = req.body.detailed === 'true';
    console.log('🤖 Generating summary, detailed:', detailed);
    
    const summary = await generateSummary(text, detailed);
    console.log('✅ Summary generated successfully');

    // Success response
    res.json({
      summary: summary,
      usage: {
        summariesToday: 1,
        subscription: 'free',
        limit: 3
      }
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('Full error:', error);
    
    // More specific error messages
    if (error.message.includes('PDF')) {
      res.status(400).json({ error: 'Invalid PDF file. Please check that it\'s a valid PDF.' });
    } else if (error.message.includes('buffer')) {
      res.status(400).json({ error: 'Cannot read file content. The file might be corrupted.' });
    } else {
      res.status(500).json({ error: 'Failed to process PDF: ' + error.message });
    }
  }
};

module.exports = { summarizePDF };