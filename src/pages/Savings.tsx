import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { Plus, Target, Calendar, TrendingUp, Star, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const savingsGoals = [
  {
    id: 1,
    name: "Buy a Laptop",
    target: 50000,
    saved: 32500,
    deadline: "2025-06-30",
    autoDebit: true,
    monthlyContribution: 5000,
    icon: "💻",
    priority: "high"
  },
  {
    id: 2,
    name: "Vacation to Goa",
    target: 25000,
    saved: 18000,
    deadline: "2025-05-15",
    autoDebit: true,
    monthlyContribution: 3000,
    icon: "🏖️",
    priority: "medium"
  },
  {
    id: 3,
    name: "Emergency Fund",
    target: 100000,
    saved: 45000,
    deadline: "2025-12-31",
    autoDebit: true,
    monthlyContribution: 8000,
    icon: "🆘",
    priority: "high"
  },
  {
    id: 4,
    name: "New Smartphone",
    target: 35000,
    saved: 12000,
    deadline: "2025-04-30",
    autoDebit: false,
    monthlyContribution: 4000,
    icon: "📱",
    priority: "low"
  }
];

const motivationalQuotes = [
  "Small savings lead to big achievements! 💪",
  "Every rupee saved is a step towards your dreams! ✨",
  "Consistency in saving creates financial freedom! 🎯",
  "Your future self will thank you for saving today! 🙏",
  "Dreams become plans when you save for them! 🌟"
];

const Savings = () => {
  const [goals, setGoals] = useState(savingsGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    deadline: "",
    monthlyContribution: "",
    icon: "🎯"
  });
  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSavedAmount = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalMonthlyContribution = goals.filter(g => g.autoDebit).reduce((sum, goal) => sum + goal.monthlyContribution, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-budget-danger bg-destructive/10';
      case 'medium': return 'text-budget-warning bg-warning-light';
      case 'low': return 'text-budget-good bg-success-light';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month left' : `${months} months left`;
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.target && newGoal.deadline) {
      const goal = {
        id: goals.length + 1,
        name: newGoal.name,
        target: parseInt(newGoal.target),
        saved: 0,
        deadline: newGoal.deadline,
        autoDebit: false,
        monthlyContribution: parseInt(newGoal.monthlyContribution) || 0,
        icon: newGoal.icon,
        priority: 'medium' as const
      };
      setGoals([...goals, goal]);
      setNewGoal({ name: "", target: "", deadline: "", monthlyContribution: "", icon: "🎯" });
      setIsDialogOpen(false);
    }
  };

  const toggleAutoDebit = (goalId: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, autoDebit: !goal.autoDebit }
        : goal
    ));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial milestones</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Buy a Car"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="target-amount">Target Amount (₹)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="50000"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-contribution">Monthly Contribution (₹)</Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    placeholder="3000"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full gradient-primary">
                  Create Savings Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Motivational Quote */}
        <Card className="gradient-purple shadow-glow border-0">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-accent-vivid mx-auto mb-3" />
            <p className="text-lg font-medium text-card-foreground">{currentQuote}</p>
          </CardContent>
        </Card>

        {/* Savings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{totalTargetAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{goals.length} active goals</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-savings">₹{totalSavedAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSavedAmount / totalTargetAmount) * 100).toFixed(1)}% of total target
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Monthly Auto-Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-vivid">₹{totalMonthlyContribution.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Automated savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const percentage = (goal.saved / goal.target) * 100;
            const remainingAmount = goal.target - goal.saved;
            const timeRemaining = getTimeRemaining(goal.deadline);

            return (
              <Card key={goal.id} className="gradient-card shadow-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{goal.icon}</div>
                      <div>
                        <CardTitle className="text-lg text-card-foreground">{goal.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                            {goal.priority} priority
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {timeRemaining}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Target className="w-5 h-5 text-accent-vivid" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-card-foreground">
                        ₹{goal.saved.toLocaleString()} / ₹{goal.target.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{percentage.toFixed(1)}% completed</span>
                      <span className="text-muted-foreground">₹{remainingAmount.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">Auto-debit monthly savings</span>
                      <Switch
                        checked={goal.autoDebit}
                        onCheckedChange={() => toggleAutoDebit(goal.id)}
                      />
                    </div>
                    {goal.autoDebit && (
                      <div className="text-xs text-muted-foreground">
                        ₹{goal.monthlyContribution.toLocaleString()} will be automatically saved each month
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-savings">
                        ₹{goal.monthlyContribution.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Monthly target</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-accent-vivid">
                        {Math.ceil(remainingAmount / goal.monthlyContribution)}
                      </div>
                      <div className="text-xs text-muted-foreground">Months to go</div>
                    </div>
                  </div>

                  <Button className="w-full gradient-primary" size="sm">
                    <Gift className="w-4 h-4 mr-2" />
                    Add Money to Goal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Savings Tips */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-savings" />
              Smart Savings Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Automate Your Success</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Set up automatic transfers on salary day</li>
                  <li>• Use the 24-hour rule before making non-essential purchases</li>
                  <li>• Round up purchases and save the change</li>
                  <li>• Save windfalls and bonuses immediately</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">Goal Optimization</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Break large goals into smaller milestones</li>
                  <li>• Prioritize emergency funds over other goals</li>
                  <li>• Review and adjust goals quarterly</li>
                  <li>• Celebrate when you reach milestones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Savings;