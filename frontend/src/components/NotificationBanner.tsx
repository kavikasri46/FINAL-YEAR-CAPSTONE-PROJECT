import { BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationBannerProps {
  show: boolean;
  message: string;
}

export function NotificationBanner({ show, message }: NotificationBannerProps) {
  if (!show) return null;

  return (
    <Alert className="mb-4">
      <BookOpen className="h-4 w-4" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
}