
// פונקציה לניתוח מסמך PDF
import pdfToText from 'react-pdftotext';

export const analyzePdfDocument = async (file: File): Promise<{ description: string; tags: string[] }> => {
  try {
    const text = await pdfToText(file);
    const lowerText = text.toLowerCase();

    const wordCount = lowerText.split(/\s+/).length;
    let description = `A PDF document with approximately ${wordCount} words`;

    const keywords = extractKeywords1(lowerText);
    if (keywords.length > 0) {
      description += `, covering topics like ${keywords.slice(0, 2).join(', ')}`;
    }

    const tags = keywords.slice(0, 10);
    return { description, tags };
  } catch (error) {
    throw new Error("Failed to analyze PDF: " + error);
  }
};

const extractKeywords1 = (text: string): string[] => {
  const stopwords = new Set([
    'the','and','is','in','to','of','with','that','for','on','as',
    'a','an','at','by','this','from','it','are','was','be','or',
    'ה','ו','של','את','על','לא','עם','כל','כי','יש','מה','אם'
  ]);

  const words = text
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 3 && !stopwords.has(w));

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
};


export const analyzeTextDocument = async (file: File): Promise<{ description: string; tags: string[] }> => {
  const content = await fileToText(file);
  const lowerText = content.toLowerCase();

  // ספירת מילים והערכת אורך
  const wordCount = content.split(/\s+/).length;
  let description = `A text document with approximately ${wordCount} words`;

  // חיפוש נושאים עיקריים (באמצעות מילות מפתח)
  const keywords = extractKeywords(lowerText);

  if (keywords.length > 0) {
    description += `, covering topics like ${keywords.slice(0, 2).join(', ')}`;
  }

  // יצירת תגיות
  const tags = keywords.slice(0, 10);

  return { description, tags };
};

const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
};

const extractKeywords = (text: string): string[] => {
  const stopwords = new Set([
    'the', 'and', 'is', 'in', 'to', 'of', 'with', 'that', 'for', 'on', 'as',
    'a', 'an', 'at', 'by', 'this', 'from', 'it', 'are', 'was', 'be', 'or',
    'ה', 'ו', 'של', 'את', 'על', 'לא', 'עם', 'כל', 'כי', 'יש', 'מה', 'אם'
  ]);

  const words = text
    .replace(/[^\p{L}\s]/gu, '') // הסרת סימנים ותווים מיוחדים
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 3 && !stopwords.has(word));

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
};




export const analyzeWithGoogleVision = async (file: File) => {
    // המרה לbase64
    const base64 = await fileToBase64(file);

    const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyADhAMSdIUxF3HhmbRzkCjFS7J8mLrQL_o`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: base64 },
                    features: [
                        { type: 'LABEL_DETECTION', maxResults: 10 },
                        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                        { type: 'TEXT_DETECTION' },
                        { type: 'FACE_DETECTION' },
                        { type: 'LANDMARK_DETECTION' }
                    ]
                }]
            })
        }
    );

    const result = await response.json();
    const annotations = result.responses[0];

    // יצירת תיאור
    const labels = annotations.labelAnnotations || [];
    const objects = annotations.localizedObjectAnnotations || [];
    const faces = annotations.faceAnnotations || [];

    let description = "An image";
    if (faces.length > 0) {
        description = `An image with ${faces.length} person${faces.length > 1 ? 's' : ''}`;
    } else if (objects.length > 0) {
        const mainObject = objects[0].name.toLowerCase();
        description = `An image containing ${mainObject}`;
    } else if (labels.length > 0) {
        description = `An image of ${labels[0].description.toLowerCase()}`;
    }

    // תגיות
    const tags = [
        ...labels.slice(0, 5).map((l: { description: string }) => l.description.toLowerCase()),
        ...objects.slice(0, 3).map((o: { name: string }) => o.name.toLowerCase())
    ];

    return { description, tags };
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};