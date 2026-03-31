import { useState, useEffect, useMemo } from 'react';
import { useAppStore, type ApplicationStatus, type Application, type StatusHistory, type Report } from '@/lib/store';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { History, Lock, Search, Filter, FileCheck } from 'lucide-react';

const CoordinatorDashboard = () => {
  const { applications, reports, currentUser, setApplications, setReports, addNotification } = useAppStore();
  
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [rationale, setRationale] = useState('');

  useEffect(() => {
    const unsubApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      const appsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          studentId: data.studentId || data.userId || '' 
        };
      }) as Application[];
      setApplications(appsData);
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
      setReports(reportsData);
    });

    return () => { unsubApps(); unsubReports(); };
  }, [setApplications, setReports]);

  const formatStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'Provisionally Accepted': 'Provisional Accept',
      'Provisionally Rejected': 'Provisional Reject',
      'Finally Accepted': 'Final Accept',
      'Finally Rejected': 'Final Reject',
      'Applied': 'Applied'
    };
    return statusMap[status] || status;
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.studentName.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      const hasSubmittedReport = reports.some(r => r.studentId === app.studentId || r.studentId === app.userId);

      switch (filter) {
        case 'applied': return app.status === 'Applied';
        case 'provisionally-accepted': return app.status === 'Provisionally Accepted';
        case 'provisionally-rejected': return app.status === 'Provisionally Rejected';
        case 'finally-accepted': return app.status === 'Finally Accepted';
        case 'finally-rejected': return app.status === 'Finally Rejected';
        case 'accepted-with-reports': return hasSubmittedReport;
        default: return true;
      }
    });
  }, [applications, reports, filter, search]);

  const handleStatusUpdate = async () => {
    if (!selectedApp || !newStatus) return toast.error("Status is required");

    const historyEntry: StatusHistory = {
      status: newStatus as ApplicationStatus,
      changedAt: new Date().toISOString(),
      changedBy: currentUser?.email || 'Coordinator',
      rationale: rationale || 'No rationale provided'
    };

    try {
      const appRef = doc(db, 'applications', selectedApp.id);
      await updateDoc(appRef, { 
        status: newStatus,
        history: arrayUnion(historyEntry)
      });
      addNotification({
        userId: selectedApp.userId,
        title: 'Application Update',
        message: `Status changed to ${formatStatusDisplay(newStatus)}.`,
        type: 'success'
      });
      toast.success('Status updated');
      setSelectedApp(null);
      setNewStatus('');
      setRationale('');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground font-medium">Welcome, {currentUser?.fullName || currentUser?.name || 'Coordinator'}</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[320px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applicants</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="provisionally-accepted">Provisional Accept</SelectItem>
            <SelectItem value="provisionally-rejected">Provisional Reject</SelectItem>
            <SelectItem value="finally-accepted">Final Accept</SelectItem>
            <SelectItem value="finally-rejected">Final Reject</SelectItem>
            <SelectItem value="accepted-with-reports">Applicants with Submitted Report</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-10" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* overflow-x-auto provides the scrollbar when the child is wider than this div */}
          <div className="overflow-x-auto">
            {/* CHANGES MADE:
                1. Added 'min-w-[800px]' to force a minimum width. 
                2. Kept 'table-fixed' so columns maintain their % proportions even when scrolling.
            */}
            <table className="w-full table-fixed min-w-[800px]">
              <thead>
                <tr className="text-left border-b text-sm font-medium text-muted-foreground">
                  <th className="pb-4 px-2 w-[25%]">Student</th>
                  <th className="pb-4 px-2 w-[20%]">Status</th>
                  <th className="pb-4 px-2 w-[15%]">Report</th>
                  <th className="pb-4 px-2 w-[15%]">Audit</th>
                  <th className="pb-4 px-2 w-[25%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredApplications.map((app) => {
                  const hasReport = reports.some(r => r.studentId === app.studentId || r.studentId === app.userId);
                  const isLocked = app.status === 'Finally Accepted' || app.status === 'Finally Rejected';
                  
                  return (
                    <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-2 font-medium truncate">{app.studentName}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          app.status.includes('Accepted') ? 'bg-green-100 text-green-700' : 
                          app.status.includes('Rejected') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {formatStatusDisplay(app.status)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {hasReport ? (
                          <div className="flex items-center text-green-600 text-xs">
                            <FileCheck className="h-3 w-3 mr-1" /> Submitted
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-normal">
                              <History className="h-3.5 w-3.5 mr-1.5"/> Logs
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Audit Trail: {app.studentName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                              {app.history?.slice().reverse().map((log, i) => (
                                <div key={i} className="p-3 border rounded-lg text-sm bg-muted/30">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-primary">{formatStatusDisplay(log.status)}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(log.changedAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs italic text-muted-foreground mb-2">"{log.rationale}"</p>
                                  <p className="text-[10px] font-medium uppercase text-muted-foreground">Changed By: {log.changedBy}</p>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {isLocked ? (
                          <Button disabled variant="secondary" size="sm" className="h-8">
                            <Lock className="h-3 w-3 mr-1" /> Locked
                          </Button>
                        ) : (
                          <Dialog open={!!selectedApp && selectedApp.id === app.id} onOpenChange={(open) => !open && setSelectedApp(null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="h-8" onClick={() => setSelectedApp(app)}>Update</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <Label>New Status</Label>
                                <Select onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Provisionally Accepted">Provisional Accept</SelectItem>
                                    <SelectItem value="Provisionally Rejected">Provisional Reject</SelectItem>
                                    <SelectItem value="Finally Accepted">Final Accept</SelectItem>
                                    <SelectItem value="Finally Rejected">Final Reject</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Label>Rationale (Optional)</Label>
                                <Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} />
                              </div>
                              <Button className="w-full" disabled={!newStatus} onClick={handleStatusUpdate}>Confirm</Button>
                            </DialogContent>
                          </Dialog>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;