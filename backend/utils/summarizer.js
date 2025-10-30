// Intelligent summarization algorithm
const generateSummary = async (text, detailed = false) => {
  console.log('🎯 Starting intelligent summarization...');
  
  try {
    // Clean and preprocess text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length < 100) {
      return "This document is very short. Key content: " + cleanText;
    }

    // Advanced text processing
    const sentences = cleanText.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Remove very short fragments

    console.log('📊 Total sentences found:', sentences.length);

    if (sentences.length === 0) {
      return "No meaningful content could be extracted for summarization.";
    }

    // Score sentences based on importance factors
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // Position scoring - first and last sentences are often important
      if (index === 0) score += 3; // First sentence
      if (index === sentences.length - 1) score += 2; // Last sentence
      if (index < 5) score += 1; // Early sentences
      
      // Length scoring - medium length sentences are often more substantial
      const length = sentence.length;
      if (length > 50 && length < 200) score += 2;
      
      // Keyword scoring - sentences with important words
      const importantWords = ['summary', 'conclusion', 'important', 'key', 'main', 'primary', 
                            'purpose', 'objective', 'goal', 'findings', 'results', 'discussion'];
      importantWords.forEach(word => {
        if (sentence.toLowerCase().includes(word)) score += 2;
      });
      
      // Question words often indicate less important sentences
      if (sentence.includes('?')) score -= 1;
      
      return { sentence, score, index };
    });

    // Sort by score (highest first)
    scoredSentences.sort((a, b) => b.score - a.score);

    console.log('🏆 Top 5 scored sentences:');
    scoredSentences.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. Score ${item.score}: ${item.sentence.substring(0, 80)}...`);
    });

    // Select sentences for summary
    let selectedSentences;
    if (detailed) {
      // Detailed summary: 5-8 high-scoring sentences in reading order
      const topSentences = scoredSentences.slice(0, 8);
      topSentences.sort((a, b) => a.index - b.index); // Reorder by original position
      selectedSentences = topSentences.map(item => item.sentence);
      
      console.log('📗 Detailed summary with', selectedSentences.length, 'sentences');
      
      return "**Detailed Summary:**\n\n" + 
             selectedSentences.map(s => `• ${s}.`).join('\n') +
             `\n\n*Summary generated from ${sentences.length} total sentences.*`;
    } else {
      // Brief summary: 2-3 highest scoring sentences in reading order
      const topSentences = scoredSentences.slice(0, 3);
      topSentences.sort((a, b) => a.index - b.index); // Reorder by original position
      selectedSentences = topSentences.map(item => item.sentence);
      
      console.log('📘 Brief summary with', selectedSentences.length, 'sentences');
      
      return "**Brief Summary:**\n\n" + 
             selectedSentences.map(s => s + '.').join(' ') +
             `\n\n*Summary generated from ${sentences.length} total sentences.*`;
    }

  } catch (error) {
    console.error('❌ Summarization error:', error);
    
    // Fallback: return first meaningful part of text
    const fallbackText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    return "**Summary:**\n\n" + fallbackText + 
           "\n\n*Note: Using fallback summary due to processing limitations.*";
  }
};

module.exports = { generateSummary };