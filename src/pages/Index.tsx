import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Shield, 
  Smartphone, 
  BarChart3, 
  PiggyBank, 
  CreditCard,
  Target,
  Bell,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/finai-hero.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "AI-powered insights into your spending patterns and financial habits"
  },
  {
    icon: PiggyBank,
    title: "Savings Goals",
    description: "Set and track your savings goals with automated recommendations"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Bank-level security with end-to-end encryption for your financial data"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Intelligent notifications for bills, budgets, and spending limits"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                FinAI
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gradient-primary shadow-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Track, Save, and{" "}
                  <span className="gradient-purple bg-clip-text text-transparent">
                    Spend Wisely
                  </span>{" "}
                  with AI Assistance
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  FinAI is your smart financial assistant that helps you manage expenses, 
                  budgets, savings, and alerts with the power of artificial intelligence.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 py-6">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    View Dashboard Demo
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="FinAI Financial Dashboard" 
                  className="rounded-2xl shadow-elevated w-full"
                />
              </div>
              <div className="absolute -inset-4 gradient-purple opacity-20 blur-3xl z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Intelligent Financial Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of personal finance with AI-powered insights, 
              automated savings, and smart spending recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card shadow-card border-0 hover:shadow-elevated transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who are already managing their money smarter with FinAI.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary shadow-glow text-lg px-12 py-6">
              Start Your Financial Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  FinAI
                </div>
              </div>
              <p className="text-muted-foreground max-w-md">
                Your smart financial assistant powered by AI. Take control of your finances 
                with intelligent insights and automated recommendations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  About
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Contact
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Help Center
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Documentation
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Community
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 FinAI. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
