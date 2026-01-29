import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { authService } from '@/services/auth.service';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaHash, setCaptchaHash] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [autoCaptcha, setAutoCaptcha] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadCaptcha = async () => {
      try {
        const data = await authService.getCaptcha();
        setCaptchaText(data.captcha);
        setCaptchaHash(data.hash);
        if (autoCaptcha) {
          setCaptchaInput(data.captcha);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadCaptcha();
  }, [autoCaptcha]);

  const refreshCaptcha = async () => {
    try {
      const data = await authService.getCaptcha();
      setCaptchaText(data.captcha);
      setCaptchaHash(data.hash);
      if (autoCaptcha) {
        setCaptchaInput(data.captcha);
      } else {
        setCaptchaInput('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ 
        identifier, 
        password,
        captcha: autoCaptcha ? captchaText : captchaInput,
        captchaHash
      });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/admin');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const demoIdentifier = import.meta.env.VITE_DEMO_IDENTIFIER || 'admin';
      const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'admin123';
      await login({
        identifier: demoIdentifier,
        password: demoPassword,
        captcha: autoCaptcha ? captchaText : captchaInput,
        captchaHash
      });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/admin');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Captcha</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Auto</Label>
                  <Switch checked={autoCaptcha} onCheckedChange={(v) => setAutoCaptcha(!!v)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input value={captchaText} readOnly className="font-mono" />
                <Button type="button" variant="secondary" onClick={refreshCaptcha}>
                  Refresh
                </Button>
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Enter captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                disabled={autoCaptcha}
                required={!autoCaptcha}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button type="button" className="w-full" variant="outline" onClick={handleDemoLogin} disabled={isLoading}>
              {isLoading ? "Please wait..." : "Login Demo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
