// Serverless function for Java compilation using JDoodle API
import fetch from 'node-fetch';

// JDoodle API configuration
const JDoodle_CONFIG = {
  clientId: process.env.JDOODLE_CLIENT_ID || '471db6e3a051d290e66025b1414a0c82',
  clientSecret: process.env.JDOODLE_CLIENT_SECRET || 'b5b224ef1aa53a75e968acef063a67ffa3512141f09a35d4fdec597794389dfe',
  apiUrl: 'https://api.jdoodle.com/v1/execute'
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, stdin = '' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    console.log('Compiling Java code with JDoodle API...');
    
    // Using JDoodle API with provided credentials
    const response = await fetch(JDoodle_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: JDoodle_CONFIG.clientId,
        clientSecret: JDoodle_CONFIG.clientSecret,
        script: code,
        stdin: stdin,
        language: 'java',
        versionIndex: '3', // JDK 15
        compileOnly: false
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Check for compilation errors
      if (result.output && result.output.toLowerCase().includes('error:')) {
        return res.status(200).json({
          success: false,
          output: result.output,
          error: 'Compilation error',
          memory: result.memory,
          cpuTime: result.cpuTime
        });
      }

      // Successful execution
      return res.status(200).json({
        success: true,
        output: result.output || 'Program executed successfully (no output)',
        memory: result.memory,
        cpuTime: result.cpuTime
      });
    } else {
      // API error
      return res.status(500).json({
        success: false,
        error: 'JDoodle API error',
        output: result.error || result.message || 'Unknown error occurred'
      });
    }

  } catch (error) {
    console.error('Compilation error:', error);
    
    // Fallback error message
    return res.status(500).json({
      success: false,
      error: 'Compilation service error',
      output: `Error: ${error.message}\nPlease check your internet connection and try again.`
    });
  }
}