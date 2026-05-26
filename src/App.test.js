import { render, screen } from '@testing-library/react';
import MainPage from './components/MainPage';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

test('renders app title', () => {
  const theme = createTheme({});
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <MainPage />
      </ThemeProvider>
    </MemoryRouter>
  );
  const title = screen.getByText(/Recon/i);
  expect(title).toBeInTheDocument();
});
