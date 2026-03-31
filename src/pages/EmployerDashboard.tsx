import { useState, useEffect } from 'react';
import { useAppStore, type Evaluation, type Report } from '@/lib/store';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Users, Download, Star } from 'lucide-react';

const EmployerDashboard = () => {
  const { currentUser } = useAppStore();
  
  // Custom local state for synced students (reports)
  const [assignedStudents, setAssignedStudents] = useState<Report[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [evalStudent, setEvalStudent] = useState('');
  const [evalTerm, setEvalTerm] = useState('');
  const [behaviour, setBehaviour] = useState('3');
  const [skills, setSkills] = useState('3');
  const [knowledge, setKnowledge] = useState('3');
  const [attitude, setAttitude] = useState('3');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const myEvals = evaluations.filter(e => e.employerId === currentUser?.id);
  const ratingOptions = ['1', '2', '3', '4', '5'];

  // IMPORTANT: Listen to reports where employerName matches this company
  useEffect(() => {
    if (!currentUser?.company) return;

    const q = query(
      collection(db, 'reports'), 
      where('employerName', '==', currentUser.company)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Report[];
      setAssignedStudents(data);
    });

    return () => unsubscribe();
  }, [currentUser?.company]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const q = query(
      collection(db, 'evaluations'),
      where('employerId', '==', currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Evaluation[];

      setEvaluations(data);
    });

    return () => unsubscribe();
  }, [currentUser?.id]); 

  const handleDownloadPdf = async () => {
    if (!evalStudent || !evalTerm) return toast.error("Select student and term");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Work Term Evaluation Form", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Employer: ${currentUser?.company}`, 20, 40);
    doc.text(`Student: ${evalStudent}`, 20, 50);
    doc.text(`Term: ${evalTerm}`, 20, 60);
    
    doc.text(`Behaviour (1 - 5):`, 20, 80);
    doc.text(`Skills (1 - 5):`, 20, 90);
    doc.text(`Knowledge (1 - 5):`, 20, 100);
    doc.text(`Attitude (1 - 5):`, 20, 110);
    
    doc.text("Comments: ", 20, 130);
    
    doc.save(`${evalStudent}_Evaluation.pdf`);
  };

  const handleSubmitEval = async () => {
    if (!evalStudent || !evalTerm) return toast.error('Fill required fields');
    
    const duplicate = myEvals.some(e => e.studentName === evalStudent && e.workTerm === evalTerm);
    if (duplicate) {
      toast.error('An evaluation for this student/term already exists');
      return;
    }

    const newEval = {
      employerId: currentUser?.id || '',
      studentName: evalStudent,
      workTerm: evalTerm,
      behaviour: parseInt(behaviour),
      skills: parseInt(skills),
      knowledge: parseInt(knowledge),
      attitude: parseInt(attitude),
      comments,
      fileName: file?.name || `${evalStudent}_Evaluation.pdf`,
      submittedAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'evaluations'), newEval);
      toast.success('Evaluation submitted!');
      setShowForm(false);
      // Reset scores
      setComments('');
      setBehaviour('3');
      setSkills('3');
      setKnowledge('3');
      setAttitude('3');
    } catch (e) {
      toast.error("Failed to save evaluation");
    }
  };

  const uniqueStudents = Array.from(
    new Map(assignedStudents.map(s => [s.studentName, s])).values()
  );

  const pendingCount = uniqueStudents.filter(
    s => !myEvals.some(e => e.studentName === s.studentName)
  ).length;

  if (!currentUser) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
      <h1 className="font-heading text-3xl font-bold">Employer Dashboard</h1>
      <p className="text-muted-foreground">{currentUser.company} — Portal</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="card-elevated">
        <CardContent className="pt-6 flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-500" />
            <div><p className="text-2xl font-bold font-heading">{uniqueStudents.length}</p>
            <p className="text-xs text-muted-foreground">Employed Students</p></div>
        </CardContent></Card>
        <Card className="card-elevated"><CardContent className="pt-6 flex items-center gap-4">
          <FileText className="h-8 w-8 text-green-500" />
          <div><p className="text-2xl font-bold">{myEvals.length}</p>
          <p className="text-xs text-muted-foreground">Submitted Evaluations</p></div>
        </CardContent></Card>
        <Card className="card-elevated">
          <CardContent className="flex items-center gap-4 pt-6">
            <Star className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold font-heading">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Evaluations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="font-heading">Employed Students</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students currently employed.</p>
          ) : (
            <div className="space-y-2">
              {uniqueStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{s.studentName}</p>
                    {/* <p className="text-xs text-muted-foreground">{s.position} — {s.startDate} to {s.endDate}</p> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Submitted Evaluations</CardTitle>
          <Button onClick={() => setShowForm(true)}><FileText className="mr-1 h-4 w-4" /> New Evaluation</Button>
        </CardHeader>
        <CardContent>
        {evaluations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No submitted evaluations yet.</p>
          ) : (
            <div className="space-y-2">
        {myEvals.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(ev => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{ev.studentName}</p>
                    <p className="text-xs text-muted-foreground">{ev.workTerm} — Submitted {new Date(ev.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>B:{ev.behaviour}</span><span>S:{ev.skills}</span><span>K:{ev.knowledge}</span><span>A:{ev.attitude}</span>
                  </div>
                </div>
          ))}
          </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Work Term Evaluation Form</DialogTitle></DialogHeader>
            
            {/* Student & Term Selection */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
                <Label>Student</Label>
                <Select value={evalStudent} onValueChange={setEvalStudent}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {uniqueStudents.map(s => (
                      <SelectItem key={s.id} value={s.studentName}>{s.studentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Term</Label>
                <Select value={evalTerm} onValueChange={setEvalTerm}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Winter 2026">Winter 2026</SelectItem>
                    <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                    <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {[
                { label: 'Behaviour', value: behaviour, setter: setBehaviour },
                { label: 'Skills', value: skills, setter: setSkills },
                { label: 'Knowledge', value: knowledge, setter: setKnowledge },
                { label: 'Attitude', value: attitude, setter: setAttitude },
              ].map(r => (
                <div key={r.label} className="space-y-2">
                  <Label>{r.label} (1 - 5)</Label>
                  <Select value={r.value} onValueChange={r.setter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map(v => <SelectItem key={v} value={v}>{v} — {['Poor','Below Average','Average','Good','Excellent'][parseInt(v)-1]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}

            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea 
                value={comments} 
                onChange={(e) => setComments(e.target.value)} 
                placeholder="How did the student perform?" 
              />
            </div>

            <div className="space-y-2">
              <Label>Upload PDF (optional)</Label>
              <Input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground">Only PDF files accepted</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSubmitEval}>Submit Evaluation</Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-1 h-4 w-4" /> Download PDF Version
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerDashboard;