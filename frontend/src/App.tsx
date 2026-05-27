import { Toaster } from 'sonner';
import { AppProviders } from '@/common/providers/AppProviders';
import { AppRouter } from '@/routes/AppRouter';
import './index.css';

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster richColors position="bottom-right" closeButton />
    </AppProviders>
  );
}

export default App;
