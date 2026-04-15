import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_KEY);

/**
 * Analyzes text content using zero-shot classification
 */
async function analyzeText(text) {
  try {
    if (!text || text.trim().length === 0) {
      return null;
    }

    return await hf.zeroShotClassification({
      model: "typeform/distilbert-base-uncased-mnli",
      inputs: text,
      candidate_labels: ["legitimate content", "spam or gibberish", "low effort submission"],
      multi_class: false
    });
  } catch (error) {
    return null;
  }
}

/**
 * Validates seller request description and files
 * File count/type validation should be in controller
 * Returns { valid, reason }
 */
async function validateSellerDescription(description, files) {
  try {
    // Check for ID document
    const hasIdCard = files.some(file => {
      const name = file.originalName.toLowerCase();
      return file.type === 'image' || name.includes('id') || name.includes('passport') || 
             name.includes('license') || name.includes('card')
    });

    if (!hasIdCard) {
      return { valid: false, reason: "ID Card required" };
    }

    // Check for CV document
    const hasCv = files.some(file => {
      const name = file.originalName.toLowerCase();
      return name.includes('cv') || name.includes('resume') || name.includes('curriculum') || 
             (file.type === 'raw' && (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')))
    });

    if (!hasCv) {
      return { valid: false, reason: "CV/Resume required" };
    }

    // Check for 2+ product images (not ID/certs)
    const productImages = files.filter(file => {
      const name = file.originalName.toLowerCase();
      return file.type === 'image' && !name.includes('id') && !name.includes('passport') && 
             !name.includes('license') && !name.includes('certificate')
    });

    if (productImages.length < 2) {
      return { valid: false, reason: `${productImages.length} product images, 2 minimum required` };
    }

    // AI content analysis
    if (process.env.HF_KEY) {
      const analysis = await analyzeText(description);
      
      if (analysis && Array.isArray(analysis) && analysis.length > 0) {
        const topResult = analysis[0];
        
        if (topResult.label !== "legitimate content" && topResult.score > 0.7) {
          return { valid: false, reason: `Content flagged: ${topResult.label.toLowerCase()}` };
        }
      }
    }

    return { valid: true, reason: "Validation passed" };

  } catch (error) {
    return { valid: true, reason: "Review required" };
  }
}

/**
 * Validates product submission using AI analysis
 * Basic validation (price, images count, description length) done in controller first
 * This focuses on AI content analysis
 * Returns { passed, reason }
 */
async function validateProductSubmission(productData) {
  try {
    const description = productData.description || "";

    if (!description || description.length === 0) {
      return { passed: false, reason: "Description required" };
    }

    // AI content analysis
    if (process.env.HF_KEY) {
      const analysis = await analyzeText(description);
      
      if (analysis && Array.isArray(analysis) && analysis.length > 0) {
        const topResult = analysis[0];
        
        if (topResult.label !== "legitimate content" && topResult.score > 0.7) {
          return { passed: false, reason: `Content flagged: ${topResult.label.toLowerCase()}` };
        }
      }
    }

    return { passed: true, reason: "Product passed quality checks" };

  } catch (error) {
    return { passed: true, reason: "Review recommended" };
  }
}

export { validateSellerDescription, validateProductSubmission, analyzeText };
