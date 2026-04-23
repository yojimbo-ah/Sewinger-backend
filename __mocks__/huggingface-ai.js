/**
 * Mock for Hugging Face AI service with improved image and PDF analysis
 * Used in tests to avoid making actual API calls
 */

const analyzeText = async (text) => {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Mock response that simulates legitimate content
  return [
    {
      labels: ["legitimate business content", "spam or gibberish", "low effort submission", "suspicious activity"],
      scores: [0.95, 0.03, 0.01, 0.01],
      label: "legitimate business content",
      score: 0.95
    }
  ];
};

const analyzeImage = async (imageBuffer, fileName) => {
  if (!imageBuffer) {
    return null;
  }

  // Mock response indicating valid document
  return {
    isDocument: true,
    confidence: 0.92,
    classification: "identification document",
    allResults: [
      { label: "identification document", score: 0.92 },
      { label: "official document", score: 0.05 },
      { label: "photograph", score: 0.03 }
    ]
  };
};

const extractPdfText = async (filePath) => {
  // Mock PDF text extraction
  if (!filePath) {
    return null;
  }

  return "John Doe\nProfessional Summary\n\nExperience:\n- Software Engineer at Tech Company\n- 5 years of experience\n\nSkills:\n- JavaScript, Python, Node.js\n- Database Design\n- API Development";
};

const validateSellerDescription = async (description, files) => {
  // Default mock: assume valid submission
  return { 
    valid: true, 
    reason: "Validation passed",
    details: {}
  };
};

const validateProductSubmission = async (productData) => {
  // Default mock: assume product passed validation
  return { 
    passed: true, 
    reason: "Product passed quality checks",
    confidence: 0.95
  };
};

export { 
  validateSellerDescription, 
  validateProductSubmission, 
  analyzeText,
  analyzeImage,
  extractPdfText
};
