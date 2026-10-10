import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './components/BottomNav';

const host = document.createElement('div');
host.id = 'nav-preview-host';
document.body.appendChild(host);

createRoot(host).render(
  <MemoryRouter initialEntries={['/stats']}>
    <BottomNav />
  </MemoryRouter>
);
