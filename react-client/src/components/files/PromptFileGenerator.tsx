import React, { useState } from 'react';
import { FileDown, Sparkles, SendHorizonal } from 'lucide-react';

const PromptFileGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedText, setGeneratedText] = useState<string>('');

  const handleGenerate = (): void => {
    const simulatedOutput = `הטקסט שלך: ${prompt}\n\nתוכן גנרי לדוגמה לקובץ...`;
    setGeneratedText(simulatedOutput);
  };

  const downloadFile = (): void => {
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.txt';
    link.click();
  };

  return (
    <div style={styles.container}>
      <h2><Sparkles size={24} /> יצירת קובץ לפי פרומפט</h2>
      <textarea
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
        placeholder="כתוב כאן את הפרומפט שלך..."
        style={styles.textarea}
      />
      <button onClick={handleGenerate} style={styles.button}>
        <SendHorizonal size={18} /> צור תוכן
      </button>

      {generatedText && (
        <div style={styles.output}>
          <pre>{generatedText}</pre>
          <button onClick={downloadFile} style={styles.download}>
            <FileDown size={18} /> הורד קובץ
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptFileGenerator;

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '12px',
    fontFamily: 'sans-serif',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '8px 12px',
    marginBottom: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  output: {
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '8px',
  },
  download: {
    marginTop: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};