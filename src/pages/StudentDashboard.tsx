import { useState, useEffect } from 'react';
import { useAppStore, type Application, type Report } from '@/lib/store';
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Clock, CheckCircle2 } from 'lucide-react';

const DEADLINE = new Date('2026-04-05T23:59:59Z');

const StudentDashboard = () => {
  const { currentUser, applications = [], reports = [], setApplications, setReports } = useAppStore();
  
  const [showUpload, setShowUpload] = useState(false);
  const [employer, setEmployer] = useState('');
  const [position, setPosition] = useState('');
  const [workTerm, setWorkTerm] = useState('Winter 2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Sync applications and reports from Firebase
  useEffect(() => {
    if (!currentUser?.id) return;

    const qApps = query(collection(db, 'applications'), where('userId', '==', currentUser.id));
    const unsubApps = onSnapshot(qApps, (snap) => {
      setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[]);
    });

    const qReports = query(collection(db, 'reports'), where('studentId', '==', currentUser.id));
    const unsubReports = onSnapshot(qReports, (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[]);
    });

    return () => { unsubApps(); unsubReports(); };
  }, [currentUser?.id, setApplications, setReports]);

  const myApp = applications[0];
  const now = new Date();
  const daysUntilDeadline = Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const deadlinePassed = daysUntilDeadline < 0;

  const handleSubmitReport = async () => {
    if (deadlinePassed) return toast.error('Deadline passed');
    if (!employer || !file) return toast.error('Please fill required fields');

    const reportData = {
      studentId: currentUser?.id || '',
      studentName: currentUser?.fullName || currentUser?.name || 'Unknown Student',
      employerName: employer,
      position,
      workTerm,
      startDate,
      endDate,
      fileName: file?.name || 'report.pdf',
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'reports'), reportData);
      toast.success('Report submitted successfully!');
      setShowUpload(false);
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  if (!currentUser) return <div className="p-20 text-center">Loading profile...</div>;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {currentUser?.fullName || currentUser?.name}</p>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardHeader><CardTitle className="text-lg">My Application Status</CardTitle></CardHeader>
        <CardContent>
          {myApp ? (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                myApp.status.includes('Accepted') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>{myApp.status}</span>
            </div>
          ) : <p className="text-sm text-muted-foreground">No application found.</p>}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Work Term Reports</CardTitle>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={deadlinePassed}><Upload className="mr-2 h-4 w-4" /> Submit Report</Button>
            </DialogTrigger>
            <DialogContent>
               <DialogHeader><DialogTitle>Upload Work Term Report</DialogTitle></DialogHeader>
               <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Employer Name</Label>
                    <Input value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g. Google" />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Term</Label>
                    <Input value={workTerm} onChange={e => setWorkTerm(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>File (PDF Only)</Label>
                    <Input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <Button className="w-full" onClick={handleSubmitReport}>Upload to System</Button>
               </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${deadlinePassed ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            <Clock className="h-4 w-4" /> {deadlinePassed ? 'Deadline passed' : `${daysUntilDeadline} days until deadline`}
          </div>
          {reports.length === 0 ? <p className="text-center py-4 text-muted-foreground">No reports uploaded.</p> : (
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center bg-card">
                  <div>
                    <p className="text-sm font-semibold">{r.employerName}</p>
                    <p className="text-xs text-muted-foreground">{r.fileName}</p>
                  </div>
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
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