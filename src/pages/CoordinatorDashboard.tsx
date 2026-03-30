import { useState, useEffect } from 'react';
import { useAppStore, type ApplicationStatus, type Application } from '@/lib/store';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Provisionally Accepted': 'bg-yellow-100 text-yellow-700',
  'Finally Accepted': 'bg-green-200 text-green-800',
  'Provisionally Rejected': 'bg-yellow-100 text-yellow-700',
  'Finally Rejected': 'bg-red-100 text-red-700',
  'Placement Rejected': 'bg-red-100 text-red-700',
};

const allStatuses: ApplicationStatus[] = [
  'No Application', 'Applied', 'Provisionally Accepted', 'Provisionally Rejected',
  'Finally Accepted', 'Finally Rejected', 'Placement Rejected', 'Dismissed',
];

const CoordinatorDashboard = () => {
  const { applications, currentUser, updateApplicationStatus, setApplications, addNotification } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          // Ensure these match your Application interface exactly
          studentId: data.studentId || '',
          studentName: data.studentName || 'Unknown Student',
          userId: data.userId || '',
          status: (data.status as ApplicationStatus) || 'Applied',
          history: data.history || [],
        };
      }) as Application[];
      
      setApplications(appsData);
    }, (error) => {
      console.error("Listener failed:", error);
      toast.error("Failed to load applications");
    });
    
    return () => unsubscribe();
  }, [setApplications]);

  const filtered = (applications || []).filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.studentName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStatusUpdate = async () => {
    if (!selectedApp || !newStatus) return;

    try {
      // 1. Update Firebase
      const appRef = doc(db, 'applications', selectedApp.id);
      await updateDoc(appRef, { status: newStatus });

      // 2. Update Local Store
      updateApplicationStatus(selectedApp.id, newStatus as ApplicationStatus, currentUser?.id || 'Admin');

      // 3. Create Notification for Student
      addNotification({
        userId: selectedApp.userId,
        title: 'Application Update',
        message: `Your application status has been changed to ${newStatus}.`,
        type: 'info'
      });

      toast.success('Status updated successfully');
      setSelectedApp(null);
      setNewStatus('');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Logged in as: {currentUser?.email}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6">
          <p className="text-2xl font-bold">{applications.length}</p>
          <p className="text-sm text-muted-foreground">Total Applications</p>
        </CardContent></Card>
      </div>

      <div className="mb-6 flex gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Search students..." className="w-[300px]" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3">Student</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b">
                  <td className="py-4">{app.studentName}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <Dialog onOpenChange={(open) => !open && setSelectedApp(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>Update</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Update Status for {selectedApp?.studentName}</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label>Select New Status</Label>
                          <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                            <SelectTrigger><SelectValue placeholder="New Status" /></SelectTrigger>
                            <SelectContent>
                              {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleStatusUpdate}>Save Changes</Button>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-10 text-center text-muted-foreground">No records found.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;