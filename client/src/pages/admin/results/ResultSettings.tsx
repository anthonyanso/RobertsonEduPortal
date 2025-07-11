import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Save, 
  Plus, 
  X, 
  BookOpen, 
  Calculator, 
  GraduationCap, 
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResultSettings() {
  const [gradingSystem, setGradingSystem] = useState("nigerian");
  const [passingGrade, setPassingGrade] = useState(40);
  const [customSubjects, setCustomSubjects] = useState([
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Geography", "History", "Economics", "Government", "Literature in English"
  ]);
  const [newSubject, setNewSubject] = useState("");
  const [showGPA, setShowGPA] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Robertson Education",
    address: "Excellence in Education",
    phone: "+234 XXX XXX XXXX",
    email: "info@robertsoneducation.edu",
    motto: "Knowledge • Character • Service",
  });

  const { toast } = useToast();

  const nigerianGrades = [
    { grade: "A1", min: 75, max: 100, remark: "Excellent" },
    { grade: "B2", min: 70, max: 74, remark: "Very Good" },
    { grade: "B3", min: 65, max: 69, remark: "Good" },
    { grade: "C4", min: 60, max: 64, remark: "Credit" },
    { grade: "C5", min: 55, max: 59, remark: "Credit" },
    { grade: "C6", min: 50, max: 54, remark: "Credit" },
    { grade: "D7", min: 45, max: 49, remark: "Pass" },
    { grade: "E8", min: 40, max: 44, remark: "Pass" },
    { grade: "F9", min: 0, max: 39, remark: "Fail" },
  ];

  const addSubject = () => {
    if (newSubject.trim() && !customSubjects.includes(newSubject.trim())) {
      setCustomSubjects([...customSubjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    setCustomSubjects(customSubjects.filter(s => s !== subject));
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your result settings have been updated successfully.",
    });
  };

  const resetToDefaults = () => {
    setGradingSystem("nigerian");
    setPassingGrade(40);
    setCustomSubjects([
      "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
      "Geography", "History", "Economics", "Government", "Literature in English"
    ]);
    setShowGPA(true);
    setShowPosition(true);
    setShowAttendance(true);
    setShowSkills(true);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Result Settings</h2>
          <p className="text-gray-600">Configure grading system and result preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nigerian Grading System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Nigerian Grading System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="passing-grade">Passing Grade</Label>
              <Input
                id="passing-grade"
                type="number"
                min="0"
                max="100"
                value={passingGrade}
                onChange={(e) => setPassingGrade(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Nigerian Grade Scale</Label>
              <div className="space-y-2 mt-2">
                {nigerianGrades.map((scale, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        scale.grade.includes('A') ? 'bg-green-100 text-green-800' :
                        scale.grade.includes('B') ? 'bg-blue-100 text-blue-800' :
                        scale.grade.includes('C') ? 'bg-yellow-100 text-yellow-800' :
                        scale.grade.includes('D') || scale.grade.includes('E') ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {scale.grade}
                      </Badge>
                      <span className="text-sm">{scale.remark}</span>
                    </div>
                    <span className="text-sm text-gray-600">{scale.min}-{scale.max}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Add New Subject</Label>
              <div className="flex space-x-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name"
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <Button onClick={addSubject} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Available Subjects ({customSubjects.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto">
                {customSubjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubject(subject)}
                      className="h-4 w-4 p-0 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show GPA</Label>
                <p className="text-sm text-gray-600">Display Grade Point Average</p>
              </div>
              <Switch checked={showGPA} onCheckedChange={setShowGPA} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show class position</Label>
                <p className="text-sm text-gray-600">Display student's position in class</p>
              </div>
              <Switch checked={showPosition} onCheckedChange={setShowPosition} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show attendance</Label>
                <p className="text-sm text-gray-600">Include attendance information</p>
              </div>
              <Switch checked={showAttendance} onCheckedChange={setShowAttendance} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show skills assessment</Label>
                <p className="text-sm text-gray-600">Include psychomotor and affective skills</p>
              </div>
              <Switch checked={showSkills} onCheckedChange={setShowSkills} />
            </div>
          </CardContent>
        </Card>

        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>School Name</Label>
              <Input
                value={schoolInfo.name}
                onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
              />
            </div>

            <div>
              <Label>Address/Tagline</Label>
              <Input
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={schoolInfo.phone}
                onChange={(e) => setSchoolInfo({...schoolInfo, phone: e.target.value})}
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                value={schoolInfo.email}
                onChange={(e) => setSchoolInfo({...schoolInfo, email: e.target.value})}
              />
            </div>

            <div>
              <Label>School Motto</Label>
              <Input
                value={schoolInfo.motto}
                onChange={(e) => setSchoolInfo({...schoolInfo, motto: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Grading System</p>
                  <p className="text-lg font-bold">Nigerian A1-F9</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Subjects</p>
                  <p className="text-lg font-bold">{customSubjects.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Passing Grade</p>
                  <p className="text-lg font-bold">{passingGrade}%</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Active Features</p>
                  <p className="text-lg font-bold">
                    {[showGPA, showPosition, showAttendance, showSkills].filter(Boolean).length}/4
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}