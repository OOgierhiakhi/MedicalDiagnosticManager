import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Stethoscope, Shield, Database, Users, RefreshCw } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    tenantId: 1, // Default tenant for demo
    role: "staff"
  });

  // Math captcha state
  const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Generate random math problem
  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = num1 + num2;
    setMathCaptcha({ num1, num2, answer });
    setUserAnswer("");
    setIsCaptchaValid(false);
  };

  // Initialize captcha on component mount
  useEffect(() => {
    generateMathProblem();
  }, []);

  // Check captcha answer
  useEffect(() => {
    const userAnswerNum = parseInt(userAnswer);
    if (!isNaN(userAnswerNum) && userAnswerNum === mathCaptcha.answer) {
      setIsCaptchaValid(true);
    } else {
      setIsCaptchaValid(false);
    }
  }, [userAnswer, mathCaptcha.answer]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaValid) {
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Orient Medical</h1>
            </div>
            <p className="text-slate-gray">Orient Medical Diagnostic Center</p>
          </div>

          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to your account to access the ERP system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                        disabled={loginMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        disabled={loginMutation.isPending}
                      />
                    </div>

                    {/* Math Captcha */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center space-x-2 text-2xl font-mono bg-white px-4 py-2 rounded border border-gray-300">
                          <span className="font-bold">{mathCaptcha.num1}</span>
                          <span>+</span>
                          <span className="font-bold">{mathCaptcha.num2}</span>
                          <span>=</span>
                          <span className="text-gray-400">?</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateMathProblem}
                          className="p-2"
                          title="Refresh captcha"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="captcha-answer">Write your answer</Label>
                        <Input
                          id="captcha-answer"
                          type="number"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Enter the sum"
                          className={`text-center ${isCaptchaValid ? 'border-green-500 bg-green-50' : ''}`}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`w-full transition-all duration-300 ${
                        isCaptchaValid 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={loginMutation.isPending || !isCaptchaValid}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Register a new user account for the ERP system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">First Name</Label>
                        <Input
                          id="register-firstName"
                          type="text"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          required
                          disabled={registerMutation.isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          required
                          disabled={registerMutation.isPending}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-medical-green hover:bg-green-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-medical-blue to-blue-800 p-8 flex items-center justify-center text-white">
        <div className="max-w-lg text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Complete ERP Solution for Medical Diagnostics
            </h2>
            <p className="text-xl text-blue-100">
              Streamline your multi-branch operations with integrated patient management, 
              financial tracking, and comprehensive reporting.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Patient Management</h3>
              <p className="text-sm text-blue-100">
                Comprehensive patient tracking with pathway switching
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Multi-Branch Sync</h3>
              <p className="text-sm text-blue-100">
                Real-time synchronization across all branches
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Financial Control</h3>
              <p className="text-sm text-blue-100">
                Complete financial and commission management
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Test Scheduling</h3>
              <p className="text-sm text-blue-100">
                Streamlined diagnostic test management
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Built for Nigerian healthcare requirements with NGN currency support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
