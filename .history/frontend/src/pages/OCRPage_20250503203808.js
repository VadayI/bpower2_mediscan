import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../api';

export default function OCRPage() {
  const [file, setFile] = useState(null);
  const [base64, setBase64] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setBase64('');
  };

  const handleBase64Change = (e) => {
    setBase64(e.target.value);
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file && !base64) {
      setError('Wybierz plik lub wklej Base64.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await api.post('/ocr/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/ocr/', { base64 });
      }

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd podczas analizy OCR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          OCR - Analiza pliku
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Wybierz plik
            <input
              type="file"
              hidden
              accept="application/pdf,image/*"
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography variant="body2">Wybrano: {file.name}</Typography>
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            lub wklej Base64 pliku:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={base64}
            onChange={handleBase64Change}
            placeholder="data:application/pdf;base64,..."
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Analizuj'}
          </Button>
        </form>

        {result && (
          <Card sx={{ mt: 4, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6">Wynik OCR:</Typography>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
