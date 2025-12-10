import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnPath?: string;
}

const AuthPromptModal = ({ isOpen, onClose, returnPath = '/' }: AuthPromptModalProps) => {
  const navigate = useNavigate();

  const handleAuth = (tab: 'signin' | 'signup') => {
    // Store the return path and auth tab preference
    sessionStorage.setItem('authReturnPath', returnPath);
    sessionStorage.setItem('authTab', tab);
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Save Your Learning Path</DialogTitle>
          <DialogDescription className="text-base">
            Create an account or sign in to save this learning path to your profile. 
            You can access it anytime from your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={() => handleAuth('signin')}
            className="w-full gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button 
            onClick={() => handleAuth('signup')}
            variant="outline"
            className="w-full gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Your learning path will be automatically saved after you sign in.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptModal;
