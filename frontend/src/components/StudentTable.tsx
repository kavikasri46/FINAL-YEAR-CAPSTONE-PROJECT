import { Student } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export function StudentTable({ students, compact = false }: { students: (Student | any)[]; compact?: boolean }) {
  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-sm text-muted-foreground">
        No students found.
      </div>
    );
  }

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
          {students.map((s, i) => {
            const name = s?.name || s?.student_name || "Unknown Student";
            const email = s?.email || "";
            const grade = s?.grade || s?.class || "-";
            const gpaNum = typeof s?.gpa === "number" ? s.gpa : (Number(s?.gpa) || 0);
            const attendanceNum = typeof s?.attendance === "number" ? s.attendance : (Number(s?.attendance) || 0);
            const riskScoreNum = typeof s?.riskScore === "number" ? s.riskScore : (typeof s?.risk_score === "number" ? s.risk_score : (Number(s?.risk_score || s?.riskScore) || 0));
            const riskLevel = s?.riskLevel || (riskScoreNum >= 70 ? "high" : riskScoreNum >= 40 ? "medium" : "low");
            const initials = name.split(" ").filter(Boolean).map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "S";
            const studentKey = s?.id || s?._id || s?.student_id || `stu-${i}`;

            return (
              <motion.tr
                key={studentKey}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{name}</p>
                      {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{grade}</TableCell>
                {!compact && (
                  <TableCell className="text-sm font-medium">
                    {gpaNum > 0 ? gpaNum.toFixed(1) : "N/A"}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={attendanceNum} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">{attendanceNum}%</span>
                  </div>
                </TableCell>
                <TableCell><RiskBadge level={riskLevel} /></TableCell>
                {!compact && (
                  <TableCell>
                    <span className="text-sm font-bold">{riskScoreNum}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </TableCell>
                )}
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
