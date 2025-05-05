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
  TableBody,
  TextField
} from '@mui/material';
import api from '../api';

export default function OCRPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState({
    "patient_data": [
      {
        "field_name": "Imię i nazwisko",
        "value": "Vadym Melnyk"
      },
      {
        "field_name": "Wiek",
        "value": "31 l."
      },
      {
        "field_name": "Nr identyfikacyjny",
        "value": "94011814514"
      },
      {
        "field_name": "Adres",
        "value": "KILIŃSKIEGO 121C/139, 90-049 ŁÓDŹ, Polska"
      }
    ],
    "exam_date": "2025-04-14",
    "content": [
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "Upłynnienie",
        "value": "prawidłowe po 30 min.",
        "unit": "",
        "status": "normal"
      },
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "Objętość",
        "value": "6,5",
        "unit": "ml",
        "status": "normal"
      },
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "pH",
        "value": "7,9",
        "unit": "",
        "status": "normal"
      },
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "Lepkość",
        "value": "(+)",
        "unit": "",
        "status": "normal"
      },
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "Aglutynacja",
        "value": "(-)",
        "unit": "",
        "status": "normal"
      },
      {
        "section_name": "Wstępna ocena makroskopowa",
        "parameter": "Komórki okrągłe",
        "value": "0,11",
        "unit": "mln/ml",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Ruch postępowy szybki (typ a)",
        "value": "22,19",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Ruch postępowy wolny (typ b)",
        "value": "42,39",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Ruch niepostępowy (typ c)",
        "value": "15,21",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Nieruchome (typ d)",
        "value": "20,20",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Ruch postępowy (a+b)",
        "value": "64,59",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Ruch całkowity (a+b+c)",
        "value": "79,80",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Ruchliwość i liczba plemników",
        "parameter": "Liczba plemników",
        "value": "40,69",
        "unit": "mln/ml",
        "status": "normal"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Plemniki o prawidłowej budowie",
        "value": "4,0",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Plemniki o nieprawidłowej budowie: główki",
        "value": "96,0",
        "unit": "%",
        "status": "high"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Plemniki o nieprawidłowej budowie: wstawki",
        "value": "24,0",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Plemniki o nieprawidłowej budowie: witki",
        "value": "10,0",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Krople cytoplazmatyczne",
        "value": "0,0",
        "unit": "%",
        "status": "normal"
      },
      {
        "section_name": "Morfologia plemników",
        "parameter": "Indeks TZI",
        "value": "1.4",
        "unit": "",
        "status": "normal"
      }
    ],
    "remarks": [
      "W preparacie bezpośrednim z nasienia obecne agregaty (++)."
    ],
    "summary": "Wyniki są w większości w normie, jednak wysoki procent plemników o nieprawidłowej budowie główki wymaga uwagi.",
    "recommendations": [
      "Skonsultuj się z lekarzem w celu dalszej oceny wyników.",
      "Rozważ powtórzenie badania za kilka miesięcy."
    ],
    "summary_note": "Rozbudowana adnotacja: wynik podsumowania wygenerowany automatycznie przez ChatGPT, nie zastępuje porady lekarskiej. W razie wątpliwości skonsultuj się z lekarzem."
  });
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
  
          {result && (
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Data Badania:</Typography>
                <Typography variant="h6">{result.exam_date}</Typography>
              </Stack>
  
              {/* Dane pacjenta */}
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
  
              {/* Wyniki badań wg sekcji */}
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
                            <TableCell>{entry.parameter}</TableCell>
                            <TableCell>{`${entry.value} ${entry.unit}`}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
  
              {/* Podgląd dodatkowych pól */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Uwagi (remarks)"
                  multiline
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={result.remarks.join('\n')}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Podsumowanie (summary)"
                  multiline
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={result.summary}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Zalecenia (recommendations)"
                  multiline
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={result.recommendations.join('\n')}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Adnotacja (summary_note)"
                  multiline
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={result.summary_note}
                  InputProps={{ readOnly: true }}
                />
              </Box>
  
            </Box>
          )}
        </CardContent>
      </Card>
    );
}
