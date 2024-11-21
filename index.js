// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const mime = require("mime-types");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper Functions
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isValidMimeType = (mimeType) => {
  const validMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain",
  ];
  return validMimeTypes.includes(mimeType);
};

const processFile = (fileBase64) => {
  try {
    const buffer = Buffer.from(fileBase64, "base64");
    const mimeType = mime.lookup(buffer) || null;

    // Validate MIME type
    if (!mimeType || !isValidMimeType(mimeType)) {
      return {
        fileValid: false,
        fileMimeType: null,
        fileSizeKB: null,
      };
    }

    const fileSizeKB = buffer.length / 1024;

    return {
      fileValid: true,
      fileMimeType: mimeType,
      fileSizeKB: fileSizeKB.toFixed(2),
    };
  } catch (error) {
    return {
      fileValid: false,
      fileMimeType: null,
      fileSizeKB: null,
    };
  }
};

// Routes
app.get("/bfhl", (req, res) => {
  try {
    res.status(200).json({
      operation_code: 1,
    });
  } catch (error) {
    res.status(500).json({
      is_success: false,
      error: "An unexpected error occurred",
    });
  }
});

app.post("/bfhl", (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    // Validate that 'data' is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid input: 'data' must be an array.");
    }

    const userId = process.env.USER_ID || "john_doe_17091999";
    const email = process.env.EMAIL || "john@xyz.com";
    const rollNumber = process.env.ROLL_NUMBER || "ABCD123";

    // Filter numbers and alphabets from the input array
    const numbers = data.filter((item) => /^[0-9]+$/.test(item));
    const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));

    // Extract lowercase alphabets and determine the highest lowercase alphabet
    const lowercaseAlphabets = alphabets.filter((ch) => /^[a-z]$/.test(ch));
    // Comment: Sorting ensures the last element is the highest in a-z order
    const highestLowercaseAlphabet = lowercaseAlphabets.length
      ? [lowercaseAlphabets.sort().pop()]
      : [];

    // Check if any number in the array is prime
    const isPrimeFound = numbers.some((num) => isPrime(parseInt(num, 10)));

    // Process the file (if provided)
    const fileInfo = file_b64
      ? processFile(file_b64)
      : { fileValid: false, fileMimeType: null, fileSizeKB: null };

    res.status(200).json({
      is_success: true,
      user_id: userId,
      email,
      roll_number: rollNumber,
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercaseAlphabet,
      is_prime_found: isPrimeFound,
      file_valid: fileInfo.fileValid,
      file_mime_type: fileInfo.fileMimeType,
      file_size_kb: fileInfo.fileSizeKB,
    });
  } catch (error) {
    console.error("Error processing POST /bfhl:", error.message);
    res.status(400).json({
      is_success: false,
      error: `Bad Request: ${error.message}`,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
