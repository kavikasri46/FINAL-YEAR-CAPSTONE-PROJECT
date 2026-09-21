import { mockMentors } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Mail, Users, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Mentors() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Mentors</h1>
          <p className="text-muted-foreground text-sm">Manage mentor assignments and profiles</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Mentor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMentors.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">{m.specialization}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="font-medium">{m.studentsAssigned}</span>
                      <span className="text-muted-foreground">students assigned</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
