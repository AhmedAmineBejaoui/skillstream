import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  BookOpen, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings,
  User,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings }
  ];

  const instructorNavItems = [
    { name: "Dashboard", href: "/instructor", icon: Home },
    { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { name: "Students", href: "/instructor/students", icon: Users },
    { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { name: "Profile", href: "/instructor/profile", icon: User }
  ];

  const studentNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
    { name: "Certificates", href: "/dashboard/certificates", icon: GraduationCap },
    { name: "Profile", href: "/dashboard/profile", icon: User }
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'instructor':
        return instructorNavItems;
      default:
        return studentNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`flex flex-col w-64 bg-white border-r border-gray-200 ${className}`}>
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <Link href="/">
          <h2 className="text-xl font-bold text-primary">EasywaysSkills</h2>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                asChild
              >
                <Link href={item.href} data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
