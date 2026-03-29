import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Briefcase, FileText, Upload, Star, Download, Users } from 'lucide-react';

const EmployerDashboard = () => {
  const { currentUser, evaluations, addEvaluation, placements } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [evalStudent, setEvalStudent] = useState('');
  const [evalTerm, setEvalTerm] = useState('');
  const [behaviour, setBehaviour] = useState('3');
  const [skills, setSkills] = useState('3');
  const [knowledge, setKnowledge] = useState('3');
  const [attitude, setAttitude] = useState('3');
  const [comments, setComments] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const employerStudents = placements.filter(p => p.employerName === (currentUser?.company || 'TechCorp Inc.'));
  const myEvals = evaluations.filter(e => e.employerId === currentUser?.id);
  const ratingOptions = ['1', '2', '3', '4', '5'];

  const handleSubmitEval = () => {
    if (!evalStudent || !evalTerm) {
      toast.error('Please select student and work term');
      return;
    }
    const duplicate = myEvals.some(e => e.studentName === evalStudent && e.workTerm === evalTerm);
    if (duplicate) {
      toast.error('An evaluation for this student/term already exists');
      return;
    }
    addEvaluation({
      employerId: currentUser?.id || 'EMP-001',
      studentName: evalStudent,
      workTerm: evalTerm,
      behaviour: parseInt(behaviour),
      skills: parseInt(skills),
      knowledge: parseInt(knowledge),
      attitude: parseInt(attitude),
      comments,
      submittedAt: new Date().toISOString(),
      pdfUrl: undefined
    });
    toast.success('Evaluation submitted!');
    setShowForm(false);
    setEvalStudent('');
    setComments('');
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      e.target.value = '';
      return;
    }
    setPdfFile(file || null);
  };

  const handleDownloadPdf = async () => {
    if (!evalStudent || !evalTerm) {
      toast.error("Please fill out student and term first");
      return;
    }
  
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text("Student Evaluation Form", 20, 20);
  
    doc.setFontSize(12);
    doc.text(`Student: ${evalStudent}`, 20, 40);
    doc.text(`Work Term: ${evalTerm}`, 20, 50);
  
    doc.text(`Behaviour: `, 20, 70);
    doc.text(`Skills: `, 20, 80);
    doc.text(`Knowledge: `, 20, 90);
    doc.text(`Attitude:  `, 20, 100);
  
    doc.text("Comments: ", 20, 120);
      
    doc.save(`${evalStudent}_evaluation.pdf`);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Employer Dashboard</h1>
        <p className="text-muted-foreground">{currentUser?.company || 'TechCorp Inc.'} — Manage student evaluations</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="card-elevated">
          <CardContent className="flex items-center gap-4 pt-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold font-heading">{employerStudents.length}</p>
              <p className="text-xs text-muted-foreground">Employed Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="flex items-center gap-4 pt-6">
            <FileText className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold font-heading">{myEvals.length}</p>
              <p className="text-xs text-muted-foreground">Submitted Forms</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="flex items-center gap-4 pt-6">
            <Star className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold font-heading">{employerStudents.filter(s => !myEvals.some(e => e.studentName === s.studentName)).length}</p>
              <p className="text-xs text-muted-foreground">Pending Evaluations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employed Students */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="font-heading">Employed Students</CardTitle>
        </CardHeader>
        <CardContent>
          {employerStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students currently employed.</p>
          ) : (
            <div className="space-y-2">
              {employerStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{s.studentName}</p>
                    <p className="text-xs text-muted-foreground">{s.position} — {s.startDate} to {s.endDate}</p>
                  </div>
                  <span className={`status-badge ${s.status === 'Active' ? 'status-accepted' : 'status-dismissed'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted evaluations */}
      <Card className="card-elevated mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Submitted Evaluations</CardTitle>
          <Button size="sm" onClick={() => setShowForm(true)}><FileText className="mr-1 h-4 w-4" /> New Evaluation</Button>
        </CardHeader>
        <CardContent>
          {myEvals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No evaluations submitted yet.</p>
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

      {/* Evaluation Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Evaluation Form</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={evalStudent} onValueChange={setEvalStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {employerStudents.map(s => <SelectItem key={s.id} value={s.studentName}>{s.studentName}</SelectItem>)}
                  <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Term</Label>
              <Select value={evalTerm} onValueChange={setEvalTerm}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
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
                <Label>{r.label} (1-5)</Label>
                <Select value={r.value} onValueChange={r.setter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map(v => <SelectItem key={v} value={v}>{v} — {['Poor','Below Avg','Average','Good','Excellent'][parseInt(v)-1]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Additional comments..." />
            </div>
            <div className="space-y-2">
              <Label>Upload PDF (optional)</Label>
              <Input type="file" accept=".pdf" onChange={handlePdfUpload} />
              <p className="text-xs text-muted-foreground">Only PDF files accepted</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSubmitEval}>Submit Online</Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-1 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerDashboard;