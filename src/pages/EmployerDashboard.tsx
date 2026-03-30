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
import { FileText, Users, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const EmployerDashboard = () => {
  const { currentUser, evaluations = [], addEvaluation } = useAppStore();
  
  // Custom local state for synced students (reports)
  const [assignedStudents, setAssignedStudents] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [evalStudent, setEvalStudent] = useState('');
  const [evalTerm, setEvalTerm] = useState('');
  const [behaviour, setBehaviour] = useState('3');
  const [skills, setSkills] = useState('3');
  const [knowledge, setKnowledge] = useState('3');
  const [attitude, setAttitude] = useState('3');
  const [comments, setComments] = useState('');

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

  const myEvals = evaluations.filter(e => e.employerId === currentUser?.id);
  const ratingOptions = ['1', '2', '3', '4', '5'];

  const handleDownloadPdf = () => {
    if (!evalStudent || !evalTerm) return toast.error("Select student and term");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Work Term Evaluation Form", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Employer: ${currentUser?.company}`, 20, 40);
    doc.text(`Student: ${evalStudent}`, 20, 50);
    doc.text(`Term: ${evalTerm}`, 20, 60);
    
    doc.text(`Behaviour: ${behaviour}/5`, 20, 80);
    doc.text(`Skills: ${skills}/5`, 20, 90);
    doc.text(`Knowledge: ${knowledge}/5`, 20, 100);
    doc.text(`Attitude: ${attitude}/5`, 20, 110);
    
    doc.text("Comments:", 20, 130);
    const splitComments = doc.splitTextToSize(comments || "No comments.", 170);
    doc.text(splitComments, 20, 140);
    
    doc.save(`${evalStudent}_Evaluation.pdf`);
  };

  const handleSubmitEval = async () => {
    if (!evalStudent || !evalTerm) return toast.error('Fill required fields');
    
    const newEval = {
      employerId: currentUser?.id || '',
      studentName: evalStudent,
      workTerm: evalTerm,
      behaviour: parseInt(behaviour),
      skills: parseInt(skills),
      knowledge: parseInt(knowledge),
      attitude: parseInt(attitude),
      comments,
      submittedAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'evaluations'), newEval);
      addEvaluation(newEval); // Sync local state
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

  if (!currentUser) return            <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <p className="text-muted-foreground">{currentUser.company} — Portal</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <Users className="h-8 w-8 text-blue-500" />
          <div><p className="text-2xl font-bold">{assignedStudents.length}</p><p className="text-xs text-muted-foreground">Assigned Students</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <FileText className="h-8 w-8 text-green-500" />
          <div><p className="text-2xl font-bold">{myEvals.length}</p><p className="text-xs text-muted-foreground">Completed Evals</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evaluations</CardTitle>
          <Button onClick={() => setShowForm(true)}>New Evaluation</Button>
        </CardHeader>
        <CardContent>
          {myEvals.length === 0 ? <p className="text-sm text-muted-foreground">No evaluations yet.</p> : (
            <div className="space-y-2">
              {myEvals.map(ev => (
                <div key={ev.id} className="p-3 border rounded flex justify-between items-center bg-card">
                  <div>
                    <p className="font-medium">{ev.studentName}</p>
                    <p className="text-xs text-muted-foreground">{ev.workTerm}</p>
                  </div>
                  <p className="text-xs font-bold">Avg: {((ev.behaviour + ev.skills + ev.knowledge + ev.attitude) / 4).toFixed(1)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Evaluation Form</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            
            {/* Student & Term Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={evalStudent} onValueChange={setEvalStudent}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {assignedStudents.map(s => (
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
            </div>

            {/* THE MISSING RATING GRID */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Behaviour', value: behaviour, setter: setBehaviour },
                { label: 'Skills', value: skills, setter: setSkills },
                { label: 'Knowledge', value: knowledge, setter: setKnowledge },
                { label: 'Attitude', value: attitude, setter: setAttitude },
              ].map(r => (
                <div key={r.label} className="space-y-2">
                  <Label>{r.label}</Label>
                  <Select value={r.value} onValueChange={r.setter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea 
                value={comments} 
                onChange={(e) => setComments(e.target.value)} 
                placeholder="How did the student perform?" 
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSubmitEval}>Submit Evaluation</Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerDashboard;