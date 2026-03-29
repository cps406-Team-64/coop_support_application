import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Upload, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DEADLINE = new Date('2026-04-01T23:59:59Z');

const StudentDashboard = () => {
  const { currentUser, applications, reports, addReport } = useAppStore();
  const [showUpload, setShowUpload] = useState(false);
  const [employer, setEmployer] = useState('');
  const [position, setPosition] = useState('');
  const [workTerm, setWorkTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const myApp = applications.find(a => a.studentId === currentUser?.studentId);
  const myReports = reports.filter(r => r.studentId === currentUser?.studentId);
  const now = new Date();
  const daysUntilDeadline = Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const deadlinePassed = daysUntilDeadline < 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted');
      e.target.value = '';
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleSubmitReport = () => {
    if (deadlinePassed) {
      toast.error('The submission deadline has passed');
      return;
    }
    if (!employer || !position || !workTerm || !startDate || !endDate || !file) {
      toast.error('Please fill all fields and upload a PDF');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    addReport({
      studentId: currentUser?.studentId || '',
      employerName: employer,
      position,
      workTerm,
      startDate,
      endDate,
      fileName: file.name,
      submittedAt: new Date().toISOString(),
    });
    toast.success('Work term report submitted!');
    setShowUpload(false);
    setFile(null);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {currentUser?.name}</p>
      </div>

      {/* Application Status */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="font-heading">My Application</CardTitle>
        </CardHeader>
        <CardContent>
          {myApp ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Application ID: {myApp.id}</span>
                <span className={`status-badge ${myApp.status === 'Finally Accepted' ? 'status-accepted' : myApp.status === 'Applied' ? 'status-applied' : 'status-rejected'}`}>{myApp.status}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status History</p>
                {myApp.history.map(h => (
                  <div key={h.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                    <span className={`status-badge text-[10px] ${h.status.includes('Accepted') ? 'status-accepted' : h.status.includes('Rejected') || h.status === 'Dismissed' ? 'status-rejected' : 'status-applied'}`}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No application found. <a href="/apply" className="text-primary hover:underline">Apply now</a></p>
          )}
        </CardContent>
      </Card>

      {/* Work Term Report */}
      <Card className="card-elevated mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Work Term Reports</CardTitle>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={deadlinePassed}><Upload className="mr-1 h-4 w-4" /> Submit Report</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit Work Term Report</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                {[
                  { id: 'employer', label: 'Employer Name', value: employer, setter: setEmployer },
                  { id: 'position', label: 'Position Title', value: position, setter: setPosition },
                  { id: 'workTerm', label: 'Work Term', value: workTerm, setter: setWorkTerm, placeholder: 'e.g. Winter 2026' },
                ].map(f => (
                  <div key={f.id} className="space-y-2">
                    <Label>{f.label}</Label>
                    <Input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder || ''} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Report PDF</Label>
                  <Input type="file" accept=".pdf" onChange={handleFileChange} />
                  <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                </div>
                <Button className="w-full" onClick={handleSubmitReport}>Submit Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Deadline warning */}
          <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${deadlinePassed ? 'bg-destructive/10 text-destructive' : daysUntilDeadline <= 7 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
            {deadlinePassed ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {deadlinePassed ? 'Deadline has passed. Uploads are closed.' : `Deadline: ${DEADLINE.toLocaleDateString()} (${daysUntilDeadline} days remaining)`}
          </div>
          {myReports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {myReports.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{r.employerName} — {r.position}</p>
                    <p className="text-xs text-muted-foreground">{r.workTerm} | {r.fileName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
