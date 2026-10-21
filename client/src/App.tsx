import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Inicio } from './pages/Inicio';
import { NoEncontrada } from './pages/NoEncontrada';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
