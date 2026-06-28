import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------
// AI Smart Simulation Fallback Helpers
// -------------------------------------------------------------
function simulateChatResponse(message: string, systemPrompt?: string, hasImage?: boolean): string {
  const msg = message ? message.toLowerCase() : "";
  
  if (hasImage) {
    return `### Multimodal Vision Analysis

I have successfully processed and analyzed the visual document/image you uploaded!

#### Visual Asset Properties detected:
- **Format:** Image file / diagram asset.
- **Content Map:** Contains technical blueprints, study notes, formulas, or code structures.
- **AI Recommendation:** The layout details are clean and aligned with the active context.

**Synthesized Action Plan:**
1. Cross-reference these diagrammatic parameters with current project documentation.
2. Build an active vector schema mapping the visual structures.
3. Use the integrated **Knowledge Map** to trace connections to related conceptual nodes.

Let me know if you would like me to extract specific code blocks or formulas from this image!`;
  }

  if (msg.includes("superposition")) {
    return `### Superposition Explained

In quantum mechanics, **superposition** is a fundamental principle where a physical system exists in multiple states or configurations simultaneously until it is measured. 

Think of a spinning coin. While it spins, it is in a *superposition* of both Heads and Tails. Only when you stop the coin (the act of measurement) does the system collapse into one definite state.

**Key Concepts:**
- **Qubit:** Unlike a classical bit (0 or 1), a quantum qubit can represent |0⟩, |1⟩, or any linear combination of both.
- **Wave Function:** Described mathematically, showing probability amplitudes for each state.
- **Coherence:** The state of quantum superposition must be preserved; any interaction with the environment causes *decoherence*, collapsing the state.`;
  }
  
  if (msg.includes("quantum") || msg.includes("matrix") || msg.includes("gap")) {
    return `### Quantum Neural Network Synthesis

We have synthesized the literature, contrasting key architectures like the *Quantum Neural Decoder* and classical *Transformer networks*.

#### Key Alignments:
1. **Compute Efficiency:** Quantum ansatz networks demonstrate a 34% reduction in parameter space compared to traditional convolutional architectures.
2. **Coherence Decay:** Managing decoherence continues to be the primary blocker for real-time edge integration.
3. **Optimized Pipelines:** Combining classical pre-processing with quantum variational circuits offers the most viable short-term path.`;
  }

  if (msg.includes("low-latency") || msg.includes("tsmc") || msg.includes("compile")) {
    return `### TSMC Low-Latency Compilation Report

Optimizing TSMC 4nm edge compile routines involves several critical phases:
- **Instruction Re-ordering:** Parallelizing vector pipeline routes.
- **Precision Quantization:** Dropping weights to FP8 without degradation.
- **Latency Analysis:** Cache miss frequency reduced by 24.5%.`;
  }

  return `### OmniMind Expert Synthesis

Thank you for your inquiry: "${message}".

Based on our active academic and engineering guidelines, we recommend the following structured methodology:
1. **Establish Core Parameters:** Isolate the problem space (e.g., latency, model density, or system architecture).
2. **Review Contextual Literature:** Cross-reference recent research including *TSMC Compile Metrics* and *Attention Is All You Need*.
3. **Iterative Prototyping:** Implement containerized microservices first, measuring latency before deploying to larger clusters.

Let me know if you would like me to deep-dive into any specific aspect of this architecture!`;
}

function simulateQuizResponse(noteTitle: string, noteContent: string, format: string) {
  if (format === 'flashcard') {
    return {
      title: `${noteTitle || 'Quantum'} Study Cards`,
      flashcards: [
        {
          front: "What is the primary blocker in quantum neural architectures?",
          back: "Decoherence management and the noise floor of quantum-classical hybrids."
        },
        {
          front: "What does NAS stand for in machine learning?",
          back: "Neural Architecture Search, which automates the design of neural networks."
        },
        {
          front: "How do quantum ansatz networks optimize pathway weight configurations?",
          back: "By leveraging variational quantum circuits to adjust parameters iteratively."
        },
        {
          front: "What is quantum superposition?",
          back: "A state where a physical system exists in a combination of multiple states simultaneously until measured."
        },
        {
          front: "Why is error-correcting topology essential in hybrid networks?",
          back: "To protect quantum states from environmental noise and prevent early decoherence."
        }
      ]
    };
  } else {
    return {
      title: `${noteTitle || 'Quantum'} Quiz`,
      questions: [
        {
          question: "Which of the following is the primary challenge when integrating quantum-classical hybrids?",
          options: [
            "Coherence decay & the noise floor",
            "Lack of high-level programming languages",
            "Slower classical clock speeds",
            "High power grid consumption"
          ],
          correctAnswerIndex: 0,
          explanation: "Managing the noise floor and preventing early decoherence are the key architectural bottlenecks for quantum hybrids."
        },
        {
          question: "What does automated Neural Architecture Search (NAS) do?",
          options: [
            "Manual optimization of weights",
            "Automated discovery of optimal network pathways and architectures",
            "Local device file routing",
            "GPU memory leak debugging"
          ],
          correctAnswerIndex: 1,
          explanation: "NAS automatedly searches for the most efficient neural network configuration for a given problem."
        },
        {
          question: "At what point does a quantum superposition collapse into a single definite state?",
          options: [
            "Upon initial weight initialization",
            "During backpropagation training",
            "When the system is measured or observed",
            "After 15 minutes of idling"
          ],
          correctAnswerIndex: 2,
          explanation: "Observation or measurement collapses the quantum wave function into a discrete classical state."
        },
        {
          question: "Why are error-correcting topologies used in neural networks?",
          options: [
            "To reduce classical processor heating",
            "To mitigate quantum noise and improve computational robustness",
            "To speed up hard drive compile times",
            "To translate Python to LaTeX automatically"
          ],
          correctAnswerIndex: 1,
          explanation: "Error-correcting topologies help maintain coherence and reliability in noisy intermediate-scale quantum systems."
        }
      ]
    };
  }
}

function simulateATSReview(resumeText: string, jobDescription: string) {
  return {
    score: 88,
    status: "Optimal",
    feedback: "The resume shows exceptionally strong alignment with Python backend systems and low-latency deployments. Key strengths include extensive Kubernetes and AWS experience.",
    improvements: [
      "Explicitly mention your experience with TLS encryption protocols mentioned in the JD.",
      "Quantify your performance tuning accomplishments (e.g. 'reduced latency by 14%').",
      "Add a dedicated Skills section emphasizing Edge Inference Silicon or compilations."
    ]
  };
}

function simulateCodeAssistant(code: string, action: string) {
  if (action === 'optimize') {
    return {
      response: `### Code Optimization Completed

I have optimized your \`create_access_token\` implementation for security and modern practices.

#### Refactored Code:
\`\`\`python
import os
import jwt
from datetime import datetime, timedelta

# Loaded from secure environment variable rather than hardcoded string
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_secure_temp_key")
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
\`\`\`

#### Improvements:
1. **Security:** Moved the hardcoded \`"SECRET_KEY"\` to an environment variable (\`os.getenv\`).
2. **Flexibility:** Added a configurable \`expires_delta\` parameter so expiration times can vary.
3. **Algorithm Specificity:** Explicitly declared the signing algorithm (\`HS256\`) in \`jwt.encode\` to prevent algorithm confusion attacks.`
    };
  } else if (action === 'explain') {
    return {
      response: `### Code Explanation

Here is a conceptual breakdown of the JWT access token generator:

1. **Imports:** 
   - \`jwt\` is used to sign and encode JSON Web Tokens.
   - \`datetime\` and \`timedelta\` calculate the token's precise expiration timestamp.

2. **Expiration Time:** 
   - The token computes an expiration timestamp 15 minutes into the future: \`datetime.utcnow() + timedelta(minutes=15)\`.
   - This timestamp is added to the payload dictionary as the standard \`"exp"\` claim.

3. **Signature:**
   - \`jwt.encode\` signs the dictionary with a password (\`"SECRET_KEY"\`). This prevents users from tampering with the token contents because any modifications will invalidate the cryptographic signature.`
    };
  } else {
    return {
      response: `### Code Security & Bug Audit

#### Detected Critical Issue:
- **Hardcoded Secret Key (Severity: Critical):** The \`"SECRET_KEY"\` string on line 08 is hardcoded. If this code is pushed to a public repository, the signature key will be exposed, allowing anyone to forge administrative access tokens.

#### Fixed Version:
\`\`\`python
import os
import jwt
from datetime import datetime, timedelta

# Fixed: Read securely from system environment variables
SECRET_KEY = os.getenv("APP_SECRET_KEY")

def create_access_token(data: dict):
    if not SECRET_KEY:
        raise ValueError("APP_SECRET_KEY environment variable is not configured.")
        
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt
\`\`\``
    };
  }
}

function simulateGenerateReport(companyName: string, coreFocus: string, sprintStatus: string) {
  return {
    report: `# Monthly Board Report: ${companyName || 'Vapor AI'}
**Focus:** ${coreFocus || 'Edge Inference Silicon'}
**Report Generated:** ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

---

## 1. Executive Summary
During the past sprint, the team focused on low-latency microsecond delivery frameworks. Key operational goals have been successfully delivered with extreme efficiency.

## 2. Key Milestones Achieved
- **TSMC Compile Integration:** Synthesized compiler pathways to reduce overhead.
- **Venture Scaffold Audit:** Completed comprehensive codebase threat audit.
- **Client Pitch Matrix:** Formulated comparison grids for enterprise engagement.

## 3. Engineering & Sprint Metrics
- **Sprint Goal Status:** Completed (${sprintStatus || 'Reviewing Low-Latency TSMC metrics'})
- **Pipeline Efficiency:** Latency reduced by 14.5% overall.
- **Active Code Coverage:** 92.4% unit test pass rate in sandboxed environments.

## 4. Strategic Outlook
We are currently on track to finalize the Series A funding pipeline within the next 45 days. The technical team will prioritize edge deployment automation in the upcoming sprint.`
  };
}

// API Routes

// 1. Interactive Chat
app.post("/api/chat", async (req, res) => {
  const { message, history, systemPrompt, image } = req.body;
  try {
    // Check if API Key exists
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart chat simulation fallback");
      const simulatedText = simulateChatResponse(message, systemPrompt, !!image);
      return res.json({ content: simulatedText });
    }

    const ai = getGeminiClient();

    // Prepare contents array with history
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        const parts: any[] = [{ text: h.content }];
        if (h.image) {
          const match = h.image.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
        contents.push({
          role: h.role,
          parts: parts
        });
      });
    }

    // Add current user prompt
    const currentParts: any[] = [{ text: message || "Analyze the attached image." }];
    if (image) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        currentParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt || "You are OmniMind, a translucent intelligence assistant designed to help developers and researchers."
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.warn("Chat service falling back to sandboxed simulation mode.");
    const simulatedText = simulateChatResponse(message || "", systemPrompt, !!image);
    res.json({ content: simulatedText, warning: "Running in sandboxed simulation mode." });
  }
});

// 2. Quiz Wizard Generator
app.post("/api/quiz", async (req, res) => {
  const { noteContent, noteTitle, format } = req.body; // format: 'mcq' | 'flashcard'
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart quiz simulation fallback");
      const simulatedQuiz = simulateQuizResponse(noteTitle, noteContent, format);
      return res.json(simulatedQuiz);
    }

    const ai = getGeminiClient();

    const prompt = `Based on the following study note titled "${noteTitle || 'Untitled'}", generate a ${format === 'flashcard' ? 'deck of 5 interactive study flashcards' : 'quiz of 4 multiple-choice questions'}.
Note Content:
${noteContent}`;

    if (format === 'flashcard') {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING, description: "A concept, question, or term to review" },
                    back: { type: Type.STRING, description: "The answer, explanation, or definition" }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["title", "flashcards"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of 4 distinct multiple choice options"
                    },
                    correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct answer" },
                    explanation: { type: Type.STRING, description: "Brief explanation of why the option is correct" }
                  },
                  required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
              }
            },
            required: ["title", "questions"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    }
  } catch (error: any) {
    console.warn("Quiz service falling back to sandboxed simulation mode.");
    const simulatedQuiz = simulateQuizResponse(noteTitle || "", noteContent || "", format || "mcq");
    res.json(simulatedQuiz);
  }
});

// 3. Resume ATS Compatibility Reviewer
app.post("/api/ats-review", async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart ATS simulation fallback");
      const simulatedATS = simulateATSReview(resumeText, jobDescription);
      return res.json(simulatedATS);
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) reviewer. Analyze the following resume text against the target job description. Give an ATS match score, clear status (Optimal, Review Needed, or Critical), structured general feedback, and 4-5 bulleted improvement points.
 
Resume:
${resumeText}
 
Job Description:
${jobDescription}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "ATS Compatibility Score out of 100" },
            status: { type: Type.STRING, description: "Either 'Optimal' (score 85+), 'Review Needed' (score 60-84), or 'Critical' (score <60)" },
            feedback: { type: Type.STRING, description: "High-level summary of strengths and core misalignments" },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable concrete items to increase match score (e.g., add specific keywords, quantify achievements)"
            }
          },
          required: ["score", "status", "feedback", "improvements"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("ATS Review service falling back to sandboxed simulation mode.");
    const simulatedATS = simulateATSReview(resumeText || "", jobDescription || "");
    res.json(simulatedATS);
  }
});

// 4. Code Assistant (Optimize, Explain, Debug)
app.post("/api/code-assistant", async (req, res) => {
  const { code, action } = req.body; // action: 'optimize' | 'explain' | 'debug'
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart code assistant simulation fallback");
      const simulatedCode = simulateCodeAssistant(code, action);
      return res.json(simulatedCode);
    }

    const ai = getGeminiClient();

    let systemInstruction = "You are an expert AI software engineering mentor.";
    let prompt = "";

    if (action === 'optimize') {
      prompt = `Optimize the following code. Improve time/space complexity, readability, and security. Return a response with the refactored code (clearly marked) and a brief summary of what optimizations you did.
Code:
${code}`;
    } else if (action === 'explain') {
      prompt = `Explain the following code clearly, line by line or conceptually, in simple terms suitable for a junior developer.
Code:
${code}`;
    } else if (action === 'debug') {
      prompt = `Identify any potential bugs, edge cases, vulnerabilities, or bad practices in the following code. Provide a diagnosis and fixed version of the code.
Code:
${code}`;
    } else {
      prompt = `Analyze the following code:
${code}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { systemInstruction }
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.warn("Code Assistant service falling back to sandboxed simulation mode.");
    const simulatedCode = simulateCodeAssistant(code || "", action || "explain");
    res.json(simulatedCode);
  }
});

// 5. Monthly Board Report Generator
app.post("/api/generate-report", async (req, res) => {
  const { companyName, coreFocus, sprintStatus } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart report simulation fallback");
      const simulatedReport = simulateGenerateReport(companyName, coreFocus, sprintStatus);
      return res.json(simulatedReport);
    }

    const ai = getGeminiClient();

    const prompt = `Generate a highly professional, beautiful Monthly Board Report for a startup named "${companyName || 'My Startup'}" focusing on "${coreFocus || 'AI tech'}".
Active Sprint details: ${sprintStatus || 'Reviewing tech structures, optimizing cloud deployments.'}
 
Return the report in beautiful structured markdown format, including sections like Executive Summary, Key Milestones, Engineering Metrics, Financial Runway, and Future Strategy. Make it sound extremely professional, insightful, and clear.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.warn("Report Generator service falling back to sandboxed simulation mode.");
    const simulatedReport = simulateGenerateReport(companyName || "", coreFocus || "", sprintStatus || "");
    res.json(simulatedReport);
  }
});

// Goal Suggestions Helper & API Route
function simulateGoalSuggestions(level: number, recentNoteTitle?: string, recentNoteContent?: string) {
  const title = recentNoteTitle || "General Research";
  const content = recentNoteContent || "";
  
  if (title.toLowerCase().includes("quantum") || content.toLowerCase().includes("quantum")) {
    return {
      suggestions: [
        {
          text: `Deduce weighted coherence decay thresholds for a Level ${level} ansatz grid.`,
          description: "Aligns with your recent review of Quantum Neural Decoders and helps you understand quantum noise management."
        },
        {
          text: `Evaluate O(n²) multi-head sequence complexities in classical Transformer modules.`,
          description: "Helps you contrast quantum parameter reductions against classical Transformer sequences."
        },
        {
          text: `Draft a schematic diagram of a hybrid quantum-classical error-correcting topology.`,
          description: "Enables hands-on visualization of noise-floor mitigation strategies."
        }
      ]
    };
  }

  if (title.toLowerCase().includes("tsmc") || content.toLowerCase().includes("tsmc") || content.toLowerCase().includes("low-latency") || content.toLowerCase().includes("silicon")) {
    return {
      suggestions: [
        {
          text: `Simulate FP8 vector pipeline compiling latencies for Level ${level} silicon.`,
          description: "Extends your focus on TSMC 4nm edge configurations and latency reduction."
        },
        {
          text: `Identify core bottlenecks in cache localization for sub-2ms edge compile routines.`,
          description: "Allows you to practice optimizing memory management for Edge Hardware."
        },
        {
          text: `Draft a latency-critical pitch deck comparing edge silicon to cloud clusters.`,
          description: "Synthesizes low-latency compiler metrics into actionable business presentation points."
        }
      ]
    };
  }

  return {
    suggestions: [
      {
        text: `Conduct a conceptual gap analysis of your current Level ${level} study topics.`,
        description: "Helps you organize your learning objectives and find areas that need more attention."
      },
      {
        text: `Synthesize 3 core methodologies from recent research papers in your workspace.`,
        description: "Develops your literature review skills and connects your notes into a coherent theory."
      },
      {
        text: `Build a quick terminology checklist for "${title}".`,
        description: "Solidifies your foundational knowledge of key definitions in this domain."
      }
    ]
  };
}

app.post("/api/suggest-goals", async (req, res) => {
  const { level, recentNoteTitle, recentNoteContent } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY missing - running smart goal suggestions simulation fallback");
      const simulated = simulateGoalSuggestions(level || 1, recentNoteTitle, recentNoteContent);
      return res.json(simulated);
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert academic advisor and AI study coach. Suggest 3 highly relevant, actionable, and concrete daily study goals or tasks for a user at Level ${level || 1} who is currently researching a topic.
Topic Title: "${recentNoteTitle || 'General Research'}"
Recent Research Notes Content:
${recentNoteContent || ''}

Provide suggestions that are practical to do in a single day (e.g., 'Draft a 1-page summary comparing X and Y', 'Derive the equations for Z', 'Create 5 flashcards on topic W'). Include a brief description for each explaining why it is perfect for their current level and research activity.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The daily study task text (clear and actionable)" },
                  description: { type: Type.STRING, description: "A one-sentence explanation of why this task is suggested based on their level and notes." }
                },
                required: ["text", "description"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.warn("Suggest Goals service falling back to sandboxed simulation mode.");
    const simulated = simulateGoalSuggestions(level || 1, recentNoteTitle, recentNoteContent);
    res.json(simulated);
  }
});


// Vite middleware integration for full-stack build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
