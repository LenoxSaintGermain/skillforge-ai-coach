
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Link } from "react-router-dom";
import { Brain, LogOut, Settings, User, BookOpen, Trophy, MessageSquare, Shield } from "lucide-react";
import { useState } from "react";
import FeedbackModal from "./feedback/FeedbackModal";

const Header = () => {
  const { currentUser, logout } = useUser();
  const { isAdmin } = useAdminRole();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  return (
    <header className="border-b border-border sticky top-0 bg-background z-10">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-8">
            <Brain className="h-6 w-6 text-skillforge-primary mr-2" />
            <span className="font-bold text-lg">
              <span className="text-skillforge-primary">Skill</span>
              <span className="text-skillforge-secondary">Forge</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            <Button variant="ghost" asChild>
              <Link to="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/scenarios">Scenarios</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/assessment">Skill Assessment</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/resources">Resources</Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={currentUser?.name || 'User'} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Learning Journey</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Achievements</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Give Feedback</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </header>
  );
};

export default Header;
