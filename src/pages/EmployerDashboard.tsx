import { useState, useEffect } from 'react';
import { useAppStore, type Evaluation, type Placement } from '@/lib/store';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Users, Star, Download } from 'lucide-react';

const EmployerDashboard = () => {
  const { currentUser, evaluations = [], addEvaluation, placements = [], setPlacements } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [evalStudent, setEvalStudent] = useState('');
  const [evalTerm, setEvalTerm] = useState('');
  const [behaviour, setBehaviour] = useState('3');
  const [skills, setSkills] = useState('3');
  const [knowledge, setKnowledge] = useState('3');
  const [attitude, setAttitude] = useState('3');
  const [comments, setComments] = useState('');

  // Real-time listener for placements related to this company
  useEffect(() => {
    if (!currentUser?.company) return;
    const q = query(collection(db, 'placements'), where('employerName', '==', currentUser.company));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Placement[];
      setPlacements(data);
    });
    return () => unsubscribe();
  }, [currentUser?.company, setPlacements]);

  const employerStudents = placements.filter(p => p.employerName === (currentUser?.company));
  const myEvals = evaluations.filter(e => e.employerId === currentUser?.id);

  const handleSubmitEval = () => {
    if (!evalStudent || !evalTerm) return toast.error('Please fill required fields');
    
    addEvaluation({
      employerId: currentUser?.id || '',
      studentName: evalStudent,
      workTerm: evalTerm,
      behaviour: parseInt(behaviour),
      skills: parseInt(skills),
      knowledge: parseInt(knowledge),
      attitude: parseInt(attitude),
      comments,
      submittedAt: new Date().toISOString(),
    });
    toast.success('Evaluation submitted!');
    setShowForm(false);
  };

  if (!currentUser) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <p className="text-muted-foreground">{currentUser.company} — Portal</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-500" />
            <div><p className="text-2xl font-bold">{employerStudents.length}</p><p className="text-xs text-muted-foreground">Students</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-green-500" />
            <div><p className="text-2xl font-bold">{myEvals.length}</p><p className="text-xs text-muted-foreground">Evaluations</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evaluations</CardTitle>
          <Button onClick={() => setShowForm(true)}>New Evaluation</Button>
        </CardHeader>
        <CardContent>
          {myEvals.length === 0 ? <p className="text-sm text-muted-foreground">No evaluations yet.</p> : (
            myEvals.map(ev => (
              <div key={ev.id} className="p-3 border-b flex justify-between">
                <span>{ev.studentName}</span>
                <span className="text-xs text-muted-foreground">{ev.workTerm}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Student Evaluation</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Student Name</Label>
            <Select onValueChange={setEvalStudent}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {employerStudents.map(s => <SelectItem key={s.id} value={s.studentName}>{s.studentName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Comments</Label>
            <Textarea value={comments} onChange={e => setComments(e.target.value)} />
            <Button className="w-full" onClick={handleSubmitEval}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerDashboard;