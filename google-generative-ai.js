import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Initialize with your API key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Converts a local file to the inline data format expected by Gemini
 */
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

/**
 * Converts a Cloudinary URL file to inline data format
 * just so i can use femini flash i jsut turn it into format
 * that he understand better
 */
async function cloudinaryFileToGenerativePart(fileUrl, mimeType) {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    };
  } catch (error) {
    console.error("Error fetching file from Cloudinary:", error);
    throw error;
  }
}


/**
 * Validates seller application using AI with Cloudinary files
 * Expects files array with { url, type, originalName }
 * Returns { valid, reason }
 */
async function validateSellerRequest(description, files) {
  try {
    const model = genAI.getGenerativeModel({ 
        // Using gemini-pro as the stable model compatible with v1beta
      model: "gemini-pro",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an automated quality control filter for a sewing marketplace seller application.
      Review the seller's description text and their attached images/documents.
      
      Seller Description: "${description}"
      
      Check for:
      1. Fake, gibberish, or spam content in the description
      2. Poor quality or irrelevant images/documents
      3. Suspicious or low-effort submissions
      4. Clear indication they are NOT selling sewing/tailoring services
      
      Be strict but fair. If something looks genuinely low-effort or spammy, reject it.
      
      Respond ONLY with valid JSON in this exact format:
      {
        "valid": boolean,
        "reason": "Brief explanation (max 50 words)"
      }
    `;

    // Convert Cloudinary files to generative parts
    // Separate images and raw files, map to appropriate MIME types
    const fileParts = await Promise.all(
      files.map(async (file) => {
        let mimeType = 'application/octet-stream';
        
        if (file.type === 'image') {
          // Try to detect image type from URL
          if (file.url.includes('.png')) mimeType = 'image/png';
          else if (file.url.includes('.jpg') || file.url.includes('.jpeg')) mimeType = 'image/jpeg';
          else if (file.url.includes('.webp')) mimeType = 'image/webp';
          else if (file.url.includes('.gif')) mimeType = 'image/gif';
          else mimeType = 'image/jpeg'; // default
        } else if (file.type === 'raw') {
          // Raw files (PDFs, docs)
          if (file.originalName.endsWith('.pdf')) mimeType = 'application/pdf';
          else if (file.originalName.endsWith('.doc') || file.originalName.endsWith('.docx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          }
        }
        
        return await cloudinaryFileToGenerativePart(file.url, mimeType);
      })
    );

    // Send prompt with files
    const result = await model.generateContent([prompt, ...fileParts]);
    const aiResponse = JSON.parse(result.response.text());
    
    return aiResponse;

  } catch (error) {
    console.error("AI Validation failed:", error);
    // If AI fails, default to manual review
    return { 
      valid: true, 
      reason: "AI validation failed - requires manual review" 
    };
  }
}

export { validateSellerRequest };