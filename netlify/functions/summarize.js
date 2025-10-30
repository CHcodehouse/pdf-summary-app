exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { text, type = 'paragraph' } = JSON.parse(event.body);
    
    if (!text) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Simple summarization logic
    let summary = '';
    const sentences = text.split('. ').filter(s => s.length > 10);
    
    switch (type) {
      case 'bullet':
        summary = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');
        break;
      case 'key-points':
        const keyPoints = sentences.slice(0, 5);
        summary = `Key Points:\n${keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join('\n')}`;
        break;
      case 'paragraph':
      default:
        summary = sentences.slice(0, 3).join('. ') + '.';
        break;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true,
        summary: summary,
        originalLength: text.length,
        summaryLength: summary.length,
        type: type
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};