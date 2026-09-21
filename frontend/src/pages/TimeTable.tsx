import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Timetable() {

  const [available, setAvailable] = useState(false);
  const [prediction, setPrediction] = useState("");

  const markAvailability = () => {
    setAvailable(true);

    // Simple prediction logic
    const freeMentor = "Prof. Sunita Das";
    setPrediction(`${freeMentor} is free now. You may take the CSDA class.`);
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Smart Timetable</h1>

      <div className="p-4 border rounded-lg space-y-4">

        <p>Mentor Availability</p>

        <Button onClick={markAvailability}>
          Mark Available
        </Button>

        {available && (
          <p className="text-green-500 font-medium">
            Mentor marked as available
          </p>
        )}

        {prediction && (
          <div className="p-3 bg-muted rounded">
            {prediction}
          </div>
        )}

      </div>

    </div>
  );
}