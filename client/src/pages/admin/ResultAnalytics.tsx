import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarChart3, TrendingUp, Users, Award, PieChart, Edit } from "lucide-react";
import { useState } from "react";

export default function ResultAnalytics() {
  const [selectedSession, setSelectedSession] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [isGradeSettingsOpen, setIsGradeSettingsOpen] = useState(false);
  const [gradeSettings, setGradeSettings] = useState({
    A: { min: 75, max: 100, name: "Excellent" },
    B: { min: 65, max: 74, name: "Very Good" },
    C: { min: 55, max: 64, name: "Good" },
    D: { min: 45, max: 54, name: "Fair" },
    F: { min: 0, max: 44, name: "Poor" },
  });

  const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
  const termOptions = ["First Term", "Second Term", "Third Term"];

  // Fetch results
  const { data: results = [], error: resultsError } = useQuery({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  // Fetch students
  const { data: students = [], error: studentsError } = useQuery({
    queryKey: ["/api/admin/students"],
    retry: false,
  });

  // Filter results based on selection
  const filteredResults = results.filter((result: any) => {
    const matchesSession = !selectedSession || selectedSession === "all" || result.session === selectedSession;
    const matchesTerm = !selectedTerm || selectedTerm === "all" || result.term === selectedTerm;
    return matchesSession && matchesTerm;
  });

  // Calculate analytics using dynamic grade settings
  const analytics = {
    totalResults: filteredResults.length,
    averageScore: filteredResults.length > 0 ? 
      (filteredResults.reduce((sum: number, r: any) => sum + (Number(r.average) || 0), 0) / filteredResults.length).toFixed(1) : 0,
    topPerformers: filteredResults.filter((r: any) => (Number(r.average) || 0) >= gradeSettings.A.min).length,
    needsImprovement: filteredResults.filter((r: any) => (Number(r.average) || 0) < gradeSettings.C.min).length,
    gradeDistribution: {
      A: filteredResults.filter((r: any) => {
        const avg = Number(r.average) || 0;
        return avg >= gradeSettings.A.min && avg <= gradeSettings.A.max;
      }).length,
      B: filteredResults.filter((r: any) => {
        const avg = Number(r.average) || 0;
        return avg >= gradeSettings.B.min && avg <= gradeSettings.B.max;
      }).length,
      C: filteredResults.filter((r: any) => {
        const avg = Number(r.average) || 0;
        return avg >= gradeSettings.C.min && avg <= gradeSettings.C.max;
      }).length,
      D: filteredResults.filter((r: any) => {
        const avg = Number(r.average) || 0;
        return avg >= gradeSettings.D.min && avg <= gradeSettings.D.max;
      }).length,
      F: filteredResults.filter((r: any) => {
        const avg = Number(r.average) || 0;
        return avg >= gradeSettings.F.min && avg <= gradeSettings.F.max;
      }).length,
    },
    subjectPerformance: getSubjectPerformance(filteredResults),
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Result Analytics</h2>
          <p className="text-gray-600">Performance analysis and insights</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessionOptions.map(session => (
                <SelectItem key={session} value={session}>{session}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {termOptions.map(term => (
                <SelectItem key={term} value={term}>{term}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalResults}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-green-600">{analytics.averageScore}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Performers</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.topPerformers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Support</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.needsImprovement}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Grade Distribution
            </div>
            <Dialog open={isGradeSettingsOpen} onOpenChange={setIsGradeSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Grades
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Grade Distribution Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(gradeSettings).map(([grade, settings]) => (
                    <div key={grade} className="grid grid-cols-4 gap-4 items-center p-3 border rounded-lg">
                      <div className="font-medium">Grade {grade}</div>
                      <div className="space-y-1">
                        <Label htmlFor={`${grade}-name`}>Name</Label>
                        <Input
                          id={`${grade}-name`}
                          value={settings.name}
                          onChange={(e) => setGradeSettings(prev => ({
                            ...prev,
                            [grade]: { ...prev[grade as keyof typeof prev], name: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${grade}-min`}>Min %</Label>
                        <Input
                          id={`${grade}-min`}
                          type="number"
                          value={settings.min}
                          onChange={(e) => setGradeSettings(prev => ({
                            ...prev,
                            [grade]: { ...prev[grade as keyof typeof prev], min: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${grade}-max`}>Max %</Label>
                        <Input
                          id={`${grade}-max`}
                          type="number"
                          value={settings.max}
                          onChange={(e) => setGradeSettings(prev => ({
                            ...prev,
                            [grade]: { ...prev[grade as keyof typeof prev], max: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsGradeSettingsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsGradeSettingsOpen(false)}>
                      Save Settings
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={
                    grade === 'A' ? 'bg-green-100 text-green-800' :
                    grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    grade === 'D' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }>
                    Grade {grade}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {gradeSettings[grade as keyof typeof gradeSettings].name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({gradeSettings[grade as keyof typeof gradeSettings].min}-{gradeSettings[grade as keyof typeof gradeSettings].max}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">{count as number}</span>
                  <span className="text-sm text-gray-500">
                    ({analytics.totalResults > 0 ? `${(((count as number) / analytics.totalResults) * 100).toFixed(1)}%` : '0%'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      {analytics.subjectPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.subjectPerformance.map((subject: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{subject.name}</div>
                    <Badge className={
                      subject.average >= 75 ? 'bg-green-100 text-green-800' :
                      subject.average >= 65 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {subject.average >= 75 ? 'Strong' :
                       subject.average >= 65 ? 'Average' : 'Needs Focus'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{subject.average.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">{subject.count} students</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {analytics.totalResults === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              {selectedSession || selectedTerm ? 
                'No results found for the selected filters.' :
                'Start by creating some results to see analytics.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getSubjectPerformance(results: any[]) {
  const subjectMap = new Map();
  
  results.forEach(result => {
    if (result.subjects && Array.isArray(result.subjects)) {
      result.subjects.forEach((subject: any) => {
        if (!subjectMap.has(subject.subject)) {
          subjectMap.set(subject.subject, { total: 0, count: 0 });
        }
        const current = subjectMap.get(subject.subject);
        current.total += Number(subject.total) || 0;
        current.count += 1;
      });
    }
  });

  return Array.from(subjectMap.entries())
    .map(([name, data]: [string, any]) => ({
      name,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count
    }))
    .sort((a, b) => b.average - a.average);
}