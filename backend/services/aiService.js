// import { GoogleGenerativeAI } from "@google/generative-ai";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
//     generationConfig:{
//         responseMimeType:"application/json",
//          temperature: 0.4,
//     },
//     systemInstruction: `
//     You are an expert in MERN and Development. You always:
//     - Write modular, maintainable code
//     - Use understandable comments
//     - Handle errors and edge cases
//     - Maintain working of previous code
//     - Follow best practices for file/folder structure
//     - Never use 'routes/index.js'
    
//     Examples:

//     <example>
//     user: Create an express application
//     response: {
//       "text": "This is your file tree structure for an Express server",
//       "fileTree": {
//         "app.js": {
//           file: {
//             contents: "const express = require('express');
// const app = express();
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });"
//           }
//         },
//         "package.json": {
//           file: {
//             contents: "{
//   'name': 'temp-server',
//   'version': '1.0.0',
//   'main': 'index.js',
//   'scripts': {
//     'start': 'node app.js'
//   },
//   'dependencies': {
//     'express': '^4.21.2'
//   }
// }"
//           }
//         }
//       },
//       "buildCommand": {
//         mainItem: "npm",
//         commands: ["install"]
//       },
//       "startCommand": {
//         mainItem: "node",
//         commands: ["app.js"]
//       }
//     }
//     </example>

//     <example>
//     user: Hello
//     response: {
//       "text": "Hello, how can I help you today?"
//     }
//     </example>
//     IMPORTANT : dont use file name like routes/index.js
//   `
//  });


// export const generateResult = async (prompt) => {
//     try {
//         console.log("Generating content for prompt:", prompt);
        
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();
        
       
//         return text;
//     } catch (error) {
//         console.error("Error generating content:", error);
//         if (error.status === 503) {
//     console.log("Gemini model is overloaded. Please try again later.");
//   }
//           return " Sorry! Gemini AI is currently overloaded. Try again later";
//     }
// };
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: `
    You are an expert in MERN and Development. You always:
    - Write modular, maintainable code
    - Use understandable comments
    - Handle errors and edge cases
    - Maintain working of previous code
    - Follow best practices for file/folder structure
    - Never use 'routes/index.js'
    
    Examples:

    <example>
    user: Create an express application
    response: {
      "text": "This is your file tree structure for an Express server",
      "fileTree": {
        "app.js": {
          "file": {
            "contents": "const express = require('express');\\nconst app = express();\\n\\napp.get('/', (req, res) => {\\n  res.send('Hello World!');\\n});\\n\\napp.listen(3000, () => {\\n  console.log('Server is running on port 3000');\\n});"
          }
        },
        "package.json": {
          "file": {
            "contents": "{\\n  \\"name\\": \\"temp-server\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"main\\": \\"index.js\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"node app.js\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"express\\": \\"^4.21.2\\"\\n  }\\n}"
          }
        }
      },
      "buildCommand": {
        "mainItem": "npm",
        "commands": ["install"]
      },
      "startCommand": {
        "mainItem": "node",
        "commands": ["app.js"]
      }
    }
    </example>

    <example>
    user: Hello
    response: {
      "text": "Hello, how can I help you today?"
    }
    </example>
    
    IMPORTANT: 
    - Always return valid JSON
    - Use double quotes for all JSON strings
    - Escape newlines as \\n in file contents
    - Escape double quotes as \\" inside strings
    - Never use file names like routes/index.js
  `
});

export const generateResult = async (prompt) => {
  try {
    console.log("Generating content for prompt:", prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response - remove any markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Validate JSON before returning
    try {
      JSON.parse(text);
      console.log("Valid JSON generated");
      return text;
    } catch (jsonError) {
      console.error("Invalid JSON from Gemini:", text);
      console.error("JSON Parse Error:", jsonError);
      
      // Return a safe fallback response
      return JSON.stringify({
        text: "I encountered a formatting error. Please try your request again.",
        error: true
      });
    }
    
  } catch (error) {
    console.error("Error generating content:", error);
    
    if (error.status === 503) {
      console.log("Gemini model is overloaded. Please try again later.");
    }
    
    // Return valid JSON even for errors
    return JSON.stringify({
      text: "Sorry! Gemini AI is currently overloaded. Try again later",
      error: true
    });
  }
};