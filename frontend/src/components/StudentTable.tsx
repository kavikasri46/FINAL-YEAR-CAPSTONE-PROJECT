import { Student } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export function StudentTable({ students, compact = false }: { students: Student[]; compact?: boolean }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50">
            <TableHead className="text-muted-foreground font-semibold">Student</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Grade</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-semibold">GPA</TableHead>}
            <TableHead className="text-muted-foreground font-semibold">Attendance</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Risk</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-semibold">Score</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s, i) => (
            <motion.tr
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{s.grade}</TableCell>
              {!compact && <TableCell className="text-sm font-medium">{s.gpa.toFixed(1)}</TableCell>}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={s.attendance} className="h-2 w-16" />
                  <span className="text-xs text-muted-foreground">{s.attendance}%</span>
                </div>
              </TableCell>
              <TableCell><RiskBadge level={s.riskLevel} /></TableCell>
              {!compact && (
                <TableCell>
                  <span className="text-sm font-bold">{s.riskScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </TableCell>
              )}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
