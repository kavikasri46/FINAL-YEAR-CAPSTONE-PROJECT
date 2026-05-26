import { mockStudents } from "@/lib/mockData";
import { StudentTable } from "@/components/StudentTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Plus } from "lucide-react";
import { useState } from "react";

export default function Students() {
  const [search, setSearch] = useState("");
  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor all students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <StudentTable students={filtered} />
    </div>
  );
}
