import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
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
  const [base64, setBase64] = useState('');
  const [result, setResult] = useState(
    {
        "patient_data": [
            {
                "field_name": "Imię i nazwisko",
                "value": "Vadym Melnyk"
            },
            {
                "field_name": "Nr identyfikacyjny",
                "value": "94011814514"
            },
            {
                "field_name": "Wiek",
                "value": "31 l."
            },
            {
                "field_name": "Adres",
                "value": "KILIŃSKIEGO 121C/139 , 90-049 ŁÓDŹ, Polska"
            },
            {
                "field_name": "Data analizy",
                "value": "14.04.2025"
            },
            {
                "field_name": "Abstynencja seksualna (dni)",
                "value": "7"
            },
            {
                "field_name": "Miejsce oddania nasienia",
                "value": "W klinice"
            },
            {
                "field_name": "ID próbki",
                "value": "140727"
            }
        ],
        "content": [
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "Upłynnienie",
                "result_value": "prawidłowe po 30 min."
            },
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "Objętość (ml)",
                "result_value": "6,5 ml"
            },
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "pH",
                "result_value": "7,9"
            },
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "Lepkość (+,++,+++)",
                "result_value": "(+)"
            },
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "Aglutynacja (-,+,++,+++)",
                "result_value": "(-)"
            },
            {
                "section_name": "WSTĘPNA OCENA MAKROSKOPOWA",
                "field_name": "Komórki okrągłe",
                "result_value": "0,11 mln/ml"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "ruch postępowy szybki (typ a)",
                "result_value": "22,19 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "ruch postępowy wolny (typ b)",
                "result_value": "42,39 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "ruch niepostępowy (typ c)",
                "result_value": "15,21 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "Nieruchome (typ d)",
                "result_value": "20,20 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "ruch postępowy (a+b)",
                "result_value": "64,59 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "ruch całkowity (a+b+c)",
                "result_value": "79,80 %"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "liczba plemników (ml)",
                "result_value": "40,69 miliony"
            },
            {
                "section_name": "RUCHLIWOŚĆ I LICZBA PLEMNIKÓW (KLASYFIKACJA WEDŁUG WHO 2021)",
                "field_name": "liczba plemników (w ejakulacie)",
                "result_value": "264,49 miliony"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "Plemniki o prawidłowej budowie",
                "result_value": "4,0 %"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "główki",
                "result_value": "96,0 %"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "wstawki",
                "result_value": "24,0 %"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "witki",
                "result_value": "10,0 %"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "krople cytoplazmatyczne",
                "result_value": "0,0 %"
            },
            {
                "section_name": "MORFOLOGIA PLEMNIKÓW",
                "field_name": "Indeks TZI",
                "result_value": "1.4"
            }
        ]
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setBase64('');
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

    // Grupowanie wyników według sekcji
    const groupedSections = result
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

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Analizuj'}
          </Button>
        </form>

        {result && (
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
