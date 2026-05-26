import { mockSessions } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const statusStyles = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Sessions() {

  // ⭐ Function to open YouTube reference video
  const handleJoinSession = () => {
    window.open("https://www.youtube.com/watch?v=rfscVS0vtbw", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm">
            Mentor-student-parent meetings
          </p>
        </div>

        <Button size="sm" className="gap-1.5">
          <Video className="h-4 w-4" /> New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSessions.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {s.title}
                  </CardTitle>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyles[s.status]}`}
                  >
                    {s.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> {s.date}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {s.time}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />{" "}
                  {s.participants.join(", ")}
                </div>

                <div className="pt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {s.type.replace(/-/g, " → ")}
                  </span>
                </div>

                {s.status === "scheduled" && (
                  <Button
                    onClick={handleJoinSession}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-1.5"
                  >
                    <Video className="h-3.5 w-3.5" /> Join Session
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}