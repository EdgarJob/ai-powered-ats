import axios from 'axios';

// Change back to using OpenAI API key
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

interface CandidateData {
  bio: string;
  employment_history: any[];
  certifications: any[];
  education_level: string;
}

export async function analyzeJobMatch(
  jobRequirements: string[], 
  jobDescription: string,
  candidateData: CandidateData
) {
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    throw new Error('OpenAI API key is not configured');
  }

  try {
    // Prepare candidate information as a string
    const employmentSummary = candidateData.employment_history
      .map(job => `Position: ${job.position}, Company: ${job.company}, Description: ${job.description || 'Not provided'}`)
      .join('\n');
    
    const certificationsSummary = candidateData.certifications
      .map(cert => `${cert.name} (Issuer: ${cert.issuer})`)
      .join(', ');

    // Format requirements as list
    const requirementsList = jobRequirements.map(req => `- ${req}`).join('\n');

    // Construct prompt for AI model
    const prompt = `
    I need to perform a comprehensive analysis of how well a candidate matches a job position. Please evaluate all aspects including skills, experience, education, responsibilities, and industry fit.

    JOB REQUIREMENTS:
    ${requirementsList}

    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE INFORMATION:
    Bio: ${candidateData.bio || 'Not provided'}
    Education: ${candidateData.education_level || 'Not provided'}
    
    Employment History:
    ${employmentSummary || 'None provided'}
    
    Certifications: 
    ${certificationsSummary || 'None provided'}

    Please perform a detailed analysis including:
    
    1. SKILLS MATCHING:
       - Extract specific skills mentioned in the candidate's bio and employment history
       - Compare these skills with both explicit and implicit skills required in the job description
       - Consider both technical and soft skills
    
    2. RESPONSIBILITY MATCHING:
       - Compare the candidate's past job responsibilities with the responsibilities required for this position
       - Identify similarities and gaps
    
    3. INDUSTRY EXPERIENCE:
       - Analyze if the candidate has worked in the same or related industries
       - Evaluate how transferable their industry experience is to this role
    
    4. EDUCATION RELEVANCE:
       - Assess if the candidate's education aligns with job requirements
       - Consider both formal education and professional certifications
    
    5. CERTIFICATION VALUE:
       - Evaluate how relevant the candidate's certifications are to this specific role
       - Consider certification issuer reputation and industry recognition

    Please analyze the match and provide:
    1. An overall match score as a percentage (0-100%)
    2. Specific scores for Skills (0-100%), Education (0-100%), Experience (0-100%), Industry Fit (0-100%), and Responsibility Match (0-100%)
    3. For each major job requirement, indicate if it's matched and provide a detailed reason
    
    Format your response as JSON with this structure:
    {
      "overallScore": number,
      "categoryScores": [
        {
          "category": "Skills",
          "score": number,
          "matches": [
            {
              "requirement": "string",
              "matched": boolean,
              "reason": "string"
            }
          ]
        },
        // Similar objects for Education, Experience, Industry Fit, and Responsibility Match
      ]
    }
    `;

    console.log('🚀 Making API call to OpenAI...');
    
    // Call OpenAI API
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a skilled HR analyst evaluating job candidate matches.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      console.log('✅ Received response from OpenAI!', {
        model: response.data.model,
        usage: response.data.usage,
        responseFirstWords: response.data.choices[0].message.content.substring(0, 50) + '...'
      });
      
      // Parse the JSON response from the AI
      const resultContent = response.data.choices[0].message.content;
      const jsonMatch = resultContent.match(/```json\n([\s\S]*?)\n```/) || 
                        resultContent.match(/{[\s\S]*}/);
      
      let jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultContent;
      
      // Clean up any markers that might be around the JSON
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\n|```/g, '');
      }

      // Parse the JSON
      return JSON.parse(jsonString);
      
    } catch (directApiError) {
      console.error('OpenAI API call failed, using simulated matching:', directApiError);
      // If the API call fails, use the fallback
      return simulateMatching(jobRequirements, candidateData);
    }
  } catch (error) {
    console.error('Error in overall job match process:', error);
    // Final fallback
    return simulateMatching(jobRequirements, candidateData);
  }
}

// Fallback function that simulates matching if API call fails - unchanged
function simulateMatching(jobRequirements: string[], candidateData: CandidateData) {
  // Same implementation as before
  const skillMatches = jobRequirements.map(req => {
    const reqLower = req.toLowerCase();
    const matched = 
      (candidateData.bio?.toLowerCase().includes(reqLower) || false) ||
      (candidateData.employment_history?.some(job => 
        job.position.toLowerCase().includes(reqLower) || 
        job.description?.toLowerCase().includes(reqLower)
      ) || false) ||
      (candidateData.certifications?.some(cert => 
        cert.name.toLowerCase().includes(reqLower)
      ) || false);
    
    return {
      requirement: req,
      matched,
      reason: matched ? `Found "${req}" in candidate profile` : `Could not find "${req}" in candidate profile`
    };
  });
  
  const educationMatch = {
    requirement: "Education",
    matched: !!candidateData.education_level,
    reason: candidateData.education_level 
      ? `Candidate has ${candidateData.education_level} education` 
      : 'Education level not specified'
  };
  
  const experienceMatch = {
    requirement: "Experience",
    matched: candidateData.employment_history?.length > 0,
    reason: candidateData.employment_history?.length > 0
      ? `Candidate has ${candidateData.employment_history.length} previous job(s)`
      : 'No employment history found'
  };
  
  const skillMatchScore = skillMatches.filter(m => m.matched).length / skillMatches.length * 100;
  const educationScore = educationMatch.matched ? 100 : 0;
  const experienceScore = experienceMatch.matched ? 100 : 0;
  
  return {
    overallScore: Math.round(skillMatchScore * 0.6 + educationScore * 0.2 + experienceScore * 0.2),
    categoryScores: [
      {
        category: 'Skills',
        score: skillMatchScore,
        matches: skillMatches
      },
      {
        category: 'Education',
        score: educationScore,
        matches: [educationMatch]
      },
      {
        category: 'Experience',
        score: experienceScore,
        matches: [experienceMatch]
      }
    ]
  };
} 