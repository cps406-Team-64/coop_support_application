import { useState } from 'react';
import { useAppStore, type ApplicationStatus } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, FileText, AlertTriangle, Filter, Clock, UserPlus, Bell, Send } from 'lucide-react';

const statusColors: Record<string, string> = {
  'Applied': 'status-applied',
  'Provisionally Accepted': 'status-accepted',
  'Provisionally Rejected': 'status-rejected',
  'Finally Accepted': 'status-accepted',
  'Finally Rejected': 'status-rejected',
  'Placement Rejected': 'status-rejected',
  'Dismissed': 'status-dismissed',
  'Flagged for Review': 'status-flagged',
};

const allStatuses: ApplicationStatus[] = [
  'Applied', 'Provisionally Accepted', 'Provisionally Rejected',
  'Finally Accepted', 'Finally Rejected', 'Placement Rejected', 'Dismissed',
];

const CoordinatorDashboard = () => {
  const { applications, currentUser, updateApplicationStatus, placements, addNotification } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [reason, setReason] = useState('');
  const [rejDate, setRejDate] = useState('');
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [studentFormEmail, setStudentFormEmail] = useState('');
  const [studentFormName, setStudentFormName] = useState('');
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');

  const filtered = applications.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.studentName.toLowerCase().includes(search.toLowerCase()) && !a.studentId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const flaggedCount = applications.filter(a => a.status === 'Flagged for Review').length;
  const activeCount = placements.filter(p => p.status === 'Active').length;

  const handleStatusUpdate = () => {
    if (!selectedApp || !newStatus) return;
    const needsReason = newStatus === 'Placement Rejected' || newStatus === 'Dismissed' || newStatus === 'Finally Rejected' || newStatus === 'Provisionally Rejected';
    if (needsReason && !reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if ((newStatus === 'Placement Rejected' || newStatus === 'Finally Rejected') && !rejDate) {
      toast.error('Please provide a rejection/effective date');
      return;
    }
    updateApplicationStatus(selectedApp, newStatus, currentUser?.id || 'COORD-001', reason || undefined);
    toast.success('Status updated successfully');
    setSelectedApp(null);
    setNewStatus('');
    setReason('');
    setRejDate('');
  };

  const handleCreateStudent = () => {
    if (!studentFormEmail.endsWith('@university.edu')) {
      toast.error('Must be a @university.edu email');
      return;
    }
    toast.success(`Student account created for ${studentFormName}. Default password sent to ${studentFormEmail}.`);
    setShowCreateStudent(false);
    setStudentFormEmail('');
    setStudentFormName('');
  };

  const handleSendNotification = () => {
    if (!notifySubject || !notifyMessage) {
      toast.error('Fill in all fields');
      return;
    }
    addNotification({
      senderId: currentUser?.id || 'COORD-001',
      recipientIds: filtered.map(a => a.studentId),
      subject: notifySubject,
      message: notifyMessage,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Notification sent to ${filtered.length} recipients`);
    setShowNotify(false);
    setNotifySubject('');
    setNotifyMessage('');
  };

  const selectedApplication = applications.find(a => a.id === selectedApp);

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Manage applications, placements, and student accounts</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-primary' },
          { label: 'Active Placements', value: activeCount, icon: Users, color: 'text-success' },
          { label: 'Flagged for Review', value: flaggedCount, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Applied (Pending)', value: applications.filter(a => a.status === 'Applied').length, icon: Clock, color: 'text-muted-foreground' },
        ].map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="flex items-center gap-4 pt-6">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {[...allStatuses, 'Flagged for Review' as ApplicationStatus].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input placeholder="Search name or ID..." className="w-[200px]" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ml-auto flex gap-2">
          <Dialog open={showCreateStudent} onOpenChange={setShowCreateStudent}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><UserPlus className="mr-1 h-4 w-4" /> Create Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Student Account</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input value={studentFormName} onChange={(e) => setStudentFormName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>School Email</Label>
                  <Input value={studentFormEmail} onChange={(e) => setStudentFormEmail(e.target.value)} placeholder="student@university.edu" />
                </div>
                <p className="text-xs text-muted-foreground">A default password will be generated from the student ID. The student will be prompted to change it on first login.</p>
                <Button className="w-full" onClick={handleCreateStudent}>Create Account</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNotify} onOpenChange={setShowNotify}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Bell className="mr-1 h-4 w-4" /> Notify</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Sending to {filtered.length} currently filtered students</p>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={notifySubject} onChange={(e) => setNotifySubject(e.target.value)} placeholder="Reminder: Submit your report" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)} placeholder="Your message..." />
                </div>
                <Button className="w-full" onClick={handleSendNotification}><Send className="mr-1 h-4 w-4" /> Send</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Applicants table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-heading">Applications ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Applied</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{app.id}</td>
                    <td className="py-3 pr-4 font-medium">{app.studentName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{app.studentEmail}</td>
                    <td className="py-3 pr-4"><span className={`status-badge ${statusColors[app.status] || ''}`}>{app.status}</span></td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app.id)}>Update</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Update Status — {app.studentName}</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label>New Status</Label>
                                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                  <SelectContent>
                                    {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              {(newStatus === 'Placement Rejected' || newStatus === 'Dismissed' || newStatus === 'Finally Rejected' || newStatus === 'Provisionally Rejected') && (
                                <>
                                  <div className="space-y-2">
                                    <Label>Reason <span className="text-destructive">*</span></Label>
                                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide reason..." />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Effective Date <span className="text-destructive">*</span></Label>
                                    <Input type="date" value={rejDate} onChange={(e) => setRejDate(e.target.value)} />
                                  </div>
                                </>
                              )}
                              <Button className="w-full" onClick={handleStatusUpdate}>Confirm Update</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">History</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Status History — {app.studentName}</DialogTitle></DialogHeader>
                            <div className="mt-2 space-y-3">
                              {app.history.map((h) => (
                                <div key={h.id} className="flex items-start gap-3 rounded-lg border p-3">
                                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`status-badge ${statusColors[h.status] || ''}`}>{h.status}</span>
                                      <span className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">By: {h.coordinatorId}</p>
                                    {h.reason && <p className="mt-1 text-xs">Reason: {h.reason}</p>}
                                  </div>
                                </div>
                              ))}
                              <p className="text-xs text-muted-foreground italic">History entries are read-only and cannot be modified.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;
