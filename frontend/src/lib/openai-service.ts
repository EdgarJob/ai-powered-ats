import axios from 'axios';

// Change to use Open Router API key
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

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
    console.error('Open Router API key is missing');
    throw new Error('Open Router API key is not configured');
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
    I need to analyze how well a candidate matches a job position based on the following information:

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

    Please analyze the match and provide:
    1. An overall match score as a percentage (0-100%)
    2. Specific scores for Skills (0-100%), Education (0-100%), and Experience (0-100%)
    3. For each job requirement, indicate if it's matched and provide a reason
    
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
        // Similar objects for Education and Experience
      ]
    }
    `;

    // Call Open Router API instead of OpenAI
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'system', content: 'You are a skilled HR analyst evaluating job candidate matches.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/EdgarJob/ai-powered-ats', // Required by OpenRouter for attribution
          'X-Title': 'AI Powered ATS' // Optional but good practice
        }
      }
    );

    // Parse the JSON response from the AI - same parsing logic but with OpenRouter response format
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
  } catch (error) {
    console.error('Error analyzing job match:', error);
    // Fallback to the simulated matching if API call fails
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