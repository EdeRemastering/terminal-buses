import { LoginBranding } from '@/modules/auth/components/LoginBranding';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      <LoginBranding />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
