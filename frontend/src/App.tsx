import { AppProviders } from '@/common/providers/AppProviders';
import { AppRouter } from '@/routes/AppRouter';
import './index.css';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
