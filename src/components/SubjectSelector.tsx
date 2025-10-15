import { Check, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { cn } from "@/lib/utils";

interface SubjectSelectorProps {
  className?: string;
}

const SubjectSelector = ({ className }: SubjectSelectorProps) => {
  const { activeSubject } = useUser();
  const { enrolledSubjects, isLoading, switchSubject } = useUserSubjects();

  // Don't render if no active subject or still loading
  if (isLoading || !activeSubject) {
    return null;
  }

  // Single subject: show as static badge
  if (enrolledSubjects.length <= 1) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border", className)}>
        <div
          className="h-3 w-3 rounded-full border"
          style={{
            backgroundColor: activeSubject.primary_color,
            borderColor: activeSubject.primary_color,
          }}
        />
        <span className="text-sm font-medium truncate max-w-[200px]">
          {activeSubject.title}
        </span>
      </div>
    );
  }

  // Multi-subject: show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 h-auto rounded-md bg-muted/50 border hover:bg-muted",
            className
          )}
        >
          <div
            className="h-3 w-3 rounded-full border"
            style={{
              backgroundColor: activeSubject.primary_color,
              borderColor: activeSubject.primary_color,
            }}
          />
          <span className="text-sm font-medium truncate max-w-[150px]">
            {activeSubject.title}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 bg-background z-50">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground font-medium">Switch Learning Subject</p>
        </div>
        {enrolledSubjects.map((subject) => {
          const isActive = subject.id === activeSubject.id;
          return (
            <DropdownMenuItem
              key={subject.id}
              onClick={() => !isActive && switchSubject(subject.id)}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer",
                isActive && "bg-accent"
              )}
            >
              <div
                className="h-3 w-3 rounded-full border mt-0.5 flex-shrink-0"
                style={{
                  backgroundColor: subject.primary_color,
                  borderColor: subject.primary_color,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{subject.title}</p>
                  {isActive && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </div>
                {subject.tagline && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {subject.tagline}
                  </p>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        <div className="border-t mt-1 pt-1 px-2 pb-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs" disabled>
            <BookOpen className="h-3 w-3 mr-2" />
            Browse More Subjects (Coming Soon)
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubjectSelector;
