import { useEffect, useState } from "react";
import { firebase, db } from "@/integrations/supabase/client";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  student_id: string;

  // ✅ ADDED (no change to existing)
  student_name?: string;
  parent_name?: string;
  priority?: string;

  parent_phone: string | null;
  parent_email: string | null;
  alert_type: string;
  message: string;
  risk_level: string | null;
  sent_via: string | null;
  is_read: boolean | null;
  created_at: string;
}

export default function ParentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();

    const q = query(collection(db, "parent_alerts"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
      setAlerts(newAlerts);
      setLoading(false);

      // Check for new alerts
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newAlert = { id: change.doc.id, ...change.doc.data() } as Alert;
          toast({
            title: "New Parent Alert",
            description: newAlert.message,
          });
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  const fetchAlerts = async () => {
    // This is now handled by the real-time listener above
  };

  const markRead = async (id: string) => {
    const alertRef = doc(db, "parent_alerts", id);
    await updateDoc(alertRef, { is_read: true });
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
  };

  const riskColor = (level: string | null) => {
    if (level === "high") return "bg-destructive/5 border-destructive/20";
    if (level === "medium") return "bg-warning/5 border-warning/20";
    return "bg-success/5 border-success/20";
  };

  // ✅ ADDED FUNCTION (priority color)
  const priorityColor = (priority?: string) => {
    if (priority === "high") return "text-red-400";
    if (priority === "medium") return "text-yellow-400";
    return "text-green-400";
  };

  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Parent Alerts</h1>
          <p className="text-muted-foreground text-sm">
            Messages sent to parents about student risk status
            {unread > 0 && (
              <span className="ml-2 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                {unread} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              No alerts yet. Upload student data and run predictions to generate alerts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-4 rounded-xl border ${riskColor(a.risk_level)} ${
                !a.is_read ? "ring-1 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">

                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        a.risk_level === "high"
                          ? "text-destructive"
                          : "text-warning"
                      }`}
                    />
                    <span className="text-sm font-semibold capitalize">
                      {a.alert_type} Alert
                    </span>

                    {/* ✅ ADDED PRIORITY */}
                    {a.priority && (
                      <span className={`text-xs font-bold ${priorityColor(a.priority)}`}>
                        • {a.priority.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* ✅ ADDED STUDENT + PARENT */}
                  <p className="text-xs text-muted-foreground mb-1">
                    👨‍🎓 {a.student_name || "Student"} | 👨‍👩‍👧 {a.parent_name || "Parent"}
                  </p>

                  <p className="text-sm">{a.message}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                    {a.parent_phone && <span>📱 {a.parent_phone}</span>}
                    {a.parent_email && <span>✉️ {a.parent_email}</span>}
                  </div>
                </div>

                {!a.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(a.id)}
                    className="text-xs shrink-0"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Mark read
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}