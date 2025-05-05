import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material';
import api from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/token/login/', { username, password });
      const token = response.data.auth_token || response.data.token;
      localStorage.setItem('token', token);
      window.location.href = '/ocr';
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', mt: 8, p: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          Zaloguj się
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Zaloguj'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
