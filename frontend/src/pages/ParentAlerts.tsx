import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { api } from "@/services/api";

interface ParentAlert {
  _id: string;
  student_id: string;
  parent_phone?: string;
  parent_email?: string;
  alert_type: string;
  message: string;
  risk_level: string;
  sent_via: string;
  is_read: boolean;
  createdAt: string;
}

export default function ParentAlerts() {
  const [alerts, setAlerts] = useState<ParentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Parent Alerts</h1>
          <p className="text-muted-foreground text-sm">Monitor and manage parent notifications</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3 w-3" /> {unreadCount} unread
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : alerts.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No alerts yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert._id} className={`border-l-4 ${alert.is_read ? "border-l-gray-300" : alert.risk_level === "high" ? "border-l-red-500" : "border-l-yellow-500"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.risk_level === "high" ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" /> : <Bell className="h-4 w-4 text-yellow-500 shrink-0" />}
                      <p className="font-medium text-sm truncate">{alert.message}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Student ID: {alert.student_id}</span>
                      {alert.parent_email && <span>• {alert.parent_email}</span>}
                      {alert.parent_phone && <span>• {alert.parent_phone}</span>}
                      <span>• {new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(alert._id)} className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Mark Read
                      </Button>
                    )}
                    {alert.is_read && <Badge variant="outline" className="text-xs">Read</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
