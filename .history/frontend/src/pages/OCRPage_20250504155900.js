import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import api from '../api';

export default function OCRPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) {
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
      }
      console.log(response)
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd podczas analizy OCR.');
    } finally {
      setLoading(false);
    }
  };

    // Grupowanie wyników według sekcji
    const groupedSections = result && result.content
    ? result.content.reduce((acc, item) => {
        const section = item.section_name || 'Inne';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
      }, {})
    : {};

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          OCR - Analiza pliku
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                    Wybierz plik
                    <input
                    type="file"
                    hidden
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    />
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !file}
                >
                    {loading ? <CircularProgress size={24} /> : 'Analizuj'}
                </Button>
            </Stack>
            {file && (
                <Typography variant="body2">Wybrano: {file.name}</Typography>
            )}
        </form>

        {result && result.content && (
          <Box sx={{ mt: 4 }}>
          {/* Sekcja danych pacjenta */}
          <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Dane pacjenta</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Pole</strong></TableCell>
                        <TableCell><strong>Wartość</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.patient_data.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.field_name}</TableCell>
                          <TableCell>{item.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
            
            {/* Wyniki badań według sekcji */}
            {Object.entries(groupedSections).map(([sectionName, items]) => (
              <Box key={sectionName} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>{sectionName}</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Parametr</strong></TableCell>
                        <TableCell><strong>Wartość</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{entry.field_name || entry.parameter}</TableCell>
                          <TableCell>{entry.result_value || `${entry.value} ${entry.unit ?? ''}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}

        </Box>
        )}
      </CardContent>
    </Card>
  );
}
