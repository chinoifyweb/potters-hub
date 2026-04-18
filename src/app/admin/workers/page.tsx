"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, HardHat, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Worker {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  department: string | null;
  role: string | null;
  notes: string | null;
  isActive: boolean;
  joinedAt: string;
}

const DEPARTMENTS = ["Choir", "Ushers", "Media", "Children", "Security", "Tech", "Prayer", "Other"];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [filterDept, setFilterDept] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/workers");
      const j = await r.json();
      setWorkers(j.workers || []);
    } catch {
      toast.error("Failed to load workers");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setFullName(""); setPhone(""); setEmail(""); setDepartment("");
    setRole(""); setNotes(""); setIsActive(true); setEditingId(null);
  }
  function openNew() { reset(); setOpen(true); }
  function openEdit(w: Worker) {
    setEditingId(w.id);
    setFullName(w.fullName); setPhone(w.phone); setEmail(w.email || "");
    setDepartment(w.department || ""); setRole(w.role || "");
    setNotes(w.notes || ""); setIsActive(w.isActive); setOpen(true);
  }

  async function save() {
    if (!fullName.trim()) { toast.error("Name required"); return; }
    if (!phone.trim()) { toast.error("Phone required"); return; }
    setSaving(true);
    try {
      const payload = { fullName, phone, email, department, role, notes, isActive };
      const url = editingId ? `/api/admin/workers/${editingId}` : "/api/admin/workers";
      const method = editingId ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      toast.success(editingId ? "Worker updated" : "Worker added");
      setOpen(false); reset(); load();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(w: Worker) {
    if (!confirm(`Delete worker ${w.fullName}?`)) return;
    try {
      const r = await fetch(`/api/admin/workers/${w.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted"); load();
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = filterDept
    ? workers.filter(w => w.department === filterDept)
    : workers;

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.isActive).length,
    depts: new Set(workers.map(w => w.department).filter(Boolean)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><HardHat className="h-7 w-7" />Workers</h1>
          <p className="text-muted-foreground">Manage departmental workers (Choir, Ushers, Media, etc.)</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Worker</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Workers</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Active</div><div className="text-2xl font-bold">{stats.active}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Departments</div><div className="text-2xl font-bold">{stats.depts}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">All Workers</h2>
          <div>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border rounded px-3 py-1 text-sm">
              <option value="">All departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.fullName}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{w.phone}</div>
                      {w.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{w.email}</div>}
                    </TableCell>
                    <TableCell>{w.department ? <Badge variant="secondary">{w.department}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{w.role || "—"}</TableCell>
                    <TableCell><Badge variant={w.isActive ? "default" : "secondary"}>{w.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(w)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => del(w)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No workers yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Worker" : "New Worker"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Department</Label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Role</Label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">—</option>
                  <option value="head">Head</option>
                  <option value="assistant">Assistant</option>
                  <option value="member">Member</option>
                </select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
