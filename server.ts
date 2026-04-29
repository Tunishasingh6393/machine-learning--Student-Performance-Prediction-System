import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Start: Student Data Simulation ---
  const names = ["Alice Chen", "Bob Smith", "Charlie Davis", "Diana Prince", "Ethan Hunt", "Fiona Gallagher", "George Miller", "Hannah Abbott", "Ian Wright", "Julia Roberts"];
  
  const generateStudent = (id: number) => {
    const name = names[id % names.length] + " " + (Math.floor(id / names.length) + 1);
    // Add randomness for more realistic data
    const baseIntelligence = 65 + Math.random() * 30;
    const baseConsistency = 60 + Math.random() * 35;
    
    return {
      id: `std-${id}`,
      name,
      attendancePct: Math.max(40, Math.min(100, baseConsistency + (Math.random() * 10 - 5))),
      quizAvg: Math.max(30, Math.min(100, baseIntelligence + (Math.random() * 20 - 10))),
      assignAvg: Math.max(30, Math.min(100, baseConsistency + (Math.random() * 15 - 7))),
      midtermScore: Math.max(20, Math.min(100, baseIntelligence - 5 + (Math.random() * 15))),
      studyHoursPerWeek: Math.max(2, Math.floor(baseConsistency / 5 + Math.random() * 5)),
      onTimeSubmissionPct: Math.max(50, Math.min(100, baseConsistency + (Math.random() * 5))),
      lmsLoginsPerWeek: Math.floor(Math.random() * 20 + 5),
      forumPosts: Math.floor(Math.random() * 10),
      priorGPA: Math.floor((2.0 + Math.random() * 2) * 10) / 10,
      commuteTimeMin: Math.floor(Math.random() * 60 + 10),
      gender: Math.random() > 0.5 ? "Female" : "Male"
    };
  };

  const students = Array.from({ length: 40 }, (_, i) => generateStudent(i + 1));
  // --- End: Student Data Simulation ---

  // API: Get all students
  app.get('/api/students', (req, res) => {
    res.json(students);
  });

  // API: Predict risk for a student
  app.post('/api/predict', async (req, res) => {
    const student = req.body;
    
    try {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback heuristic if API key is missing
        const risk = (100 - student.attendancePct) * 0.4 + (100 - student.quizAvg) * 0.6;
        return res.json({
          riskScore: Math.round(risk),
          atRisk: risk > 60,
          gradeBand: risk > 80 ? 'F' : risk > 60 ? 'D' : risk > 40 ? 'C' : risk > 20 ? 'B' : 'A',
          confidence: 0.85,
          topFactors: ["Attendance", "Quiz Scores"],
          interventions: ["Mandatory Tutoring"],
          explanation: "Fallback heuristic prediction based on academic performance signals."
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        As an expert Student Performance Predictor, analyze this student data and predict their end-term success.
        
        DATA:
        - Attendance: ${student.attendancePct}%
        - Quiz Average: ${student.quizAvg}/100
        - Assignments Average: ${student.assignAvg}/100
        - Midterm Score: ${student.midtermScore}/100
        - Study Hours/Week: ${student.studyHoursPerWeek}
        - On-Time Submissions: ${student.onTimeSubmissionPct}%
        - Prior GPA: ${student.priorGPA}
        
        Return a JSON object with:
        {
          "riskScore": number (0-100),
          "atRisk": boolean,
          "gradeBand": "A" | "B" | "C" | "D" | "F",
          "confidence": number (0-1),
          "topFactors": string[],
          "interventions": string[],
          "explanation": string (brief reasoning)
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonResponse = JSON.parse(text.replace(/```json|```/g, ""));
      res.json(jsonResponse);
    } catch (error) {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Failed to process prediction" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
