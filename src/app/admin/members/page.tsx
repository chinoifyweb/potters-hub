"use client";
import { useEffect, useState } from "react";
import { Loader2, Search, Users, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface M {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  phone?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function Page() {
  const [members, setMembers] = useState<M[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("member");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/members?limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      const d = await r.json();
      setMembers(d.members || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleActive = async (m: M) => {
    try {
      const r = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: m.id, isActive: !m.isActive }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success(m.isActive ? "Deactivated" : "Activated");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  function reset() {
    setFullName(""); setEmail(""); setPhone(""); setRole("member"); setEditingId(null);
  }
  function openNew() { reset(); setOpen(true); }
  function openEdit(m: M) {
    setEditingId(m.id);
    setFullName(m.fullName); setEmail(m.email);
    setPhone(m.phone || ""); setRole(m.role);
    setOpen(true);
  }

  async function save() {
    if (!fullName.trim()) { toast.error("Name required"); return; }
    if (!email.trim()) { toast.error("Email required"); return; }
    setSaving(true);
    try {
      let r: Response;
      if (editingId) {
        r = await fetch(`/api/admin/members/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, role }),
        });
      } else {
        r = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, role }),
        });
      }
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      toast.success(editingId ? "Member updated" : "Member added");
      setOpen(false); reset(); load();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(m: M) {
    if (!confirm(`Deactivate ${m.fullName}? (Users are soft-deleted to preserve history.)`)) return;
    try {
      const r = await fetch(`/api/admin/members/${m.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deactivated"); load();
    } catch {
      toast.error("Delete failed");
    }
  }

  const roleVariant = (r: string): any =>
    r === "admin" ? "default" : r === "pastor" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Member</Button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <Button variant="outline" onClick={load}>Search</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.avatarUrl || ""} />
                            <AvatarFallback>{(m.fullName || "?").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{m.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>{m.phone || "—"}</TableCell>
                      <TableCell><Badge variant={roleVariant(m.role)}>{m.role}</Badge></TableCell>
                      <TableCell>{m.isVerified ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                      <TableCell><Switch checked={m.isActive} onCheckedChange={() => toggleActive(m)} /></TableCell>
                      <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => del(m)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" /></div>
            <div>
              <Label>Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="member">Member</option>
                <option value="pastor">Pastor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
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
