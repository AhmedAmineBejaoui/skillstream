import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Search, Heart, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { name: "Courses", href: "/courses" },
    { name: "Categories", href: "/categories" },
    { name: "Instructors", href: "/instructors" },
    { name: "About", href: "/about" }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">EasywaysSkills</h1>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search courses, instructors, topics..."
                className="pl-10 w-full"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" data-testid="button-wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="relative" data-testid="button-cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-profile">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start">
                      <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="outline" data-testid="button-login">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild data-testid="button-signup">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
