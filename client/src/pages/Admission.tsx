import { useEffect } from "react";
import { Download, FileText, Phone, MapPin, Clock, Calendar, Users, DollarSign, CheckCircle, Mail, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAdmissionPDF } from "@/lib/pdfGenerator";
import { useQuery } from "@tanstack/react-query";

export default function Admission() {
  const { data: admissionSettings, isLoading } = useQuery({
    queryKey: ['/api/admission-settings'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Check if admissions are enabled
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/admin/school-info"],
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds cache
  });

  const settingsMap = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const isAdmissionsEnabled = settingsMap.enable_admissions === 'true';

  const handleDownloadPDF = () => {
    const blankFormData = {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      address: "",
      gradeLevel: "",
      preferredStartDate: "",
      previousSchool: "",
      previousSchoolAddress: "",
      lastGradeCompleted: "",
      fatherName: "",
      motherName: "",
      fatherOccupation: "",
      motherOccupation: "",
      guardianPhone: "",
      guardianEmail: "",
      medicalConditions: "",
      specialNeeds: "",
      heardAboutUs: "",
    };
    generateAdmissionPDF(blankFormData);
  };

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      await import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true
      });
    };

    initAOS();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Admission Application
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Begin your journey with Robertson Education. Follow the steps below to apply for admission.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {!isAdmissionsEnabled ? (
              <Card className="mb-8" data-aos="fade-up">
                <CardContent className="p-8">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Admissions Disabled</AlertTitle>
                    <AlertDescription className="text-red-700">
                      The admission system is currently disabled by the school administrator. 
                      Please contact the school office for information about current enrollment or check back later.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Application Process */}
            <Card className="mb-8" data-aos="fade-up">
              <CardHeader className="bg-red-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-playfair text-3xl font-bold mb-2">
                      Admission Application Process
                    </CardTitle>
                    <p className="text-yellow-400">Academic Year 2024-2025</p>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="secondary"
                    className="bg-yellow-500 hover:bg-yellow-400 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Admission Form (PDF)
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Application Instructions */}
            <Card className="mb-8" data-aos="fade-up">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
                      How to Apply for Admission
                    </h2>
                    <p className="text-lg text-gray-600">
                      Follow these simple steps to complete your admission application
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Download Form</h3>
                      <p className="text-sm text-gray-600">
                        Click the "Download Admission Form (PDF)" button above to get the official application form
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        2
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Fill Out Form</h3>
                      <p className="text-sm text-gray-600">
                        Complete all sections of the admission form with accurate information
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        3
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Submit in Person</h3>
                      <p className="text-sm text-gray-600">
                        Bring the completed form to our school office for physical submission
                      </p>
                    </div>
                  </div>

                  {/* Admission Status */}
                  {admissionSettings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="font-semibold text-green-800">Admission Status</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Application Period: {new Date(admissionSettings.startDate).toLocaleDateString()} - {new Date(admissionSettings.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Maximum Applications: {admissionSettings.maxApplications}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Application Fee: ₦{admissionSettings.applicationFee?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Classes */}
                  {admissionSettings && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-blue-800 mb-4">Available Classes</h3>
                      <div className="flex flex-wrap gap-2">
                        {admissionSettings.availableClasses.map((cls: string) => (
                          <Badge key={cls} variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {admissionSettings && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-orange-800 mb-3">
                        <FileText className="inline-block mr-2 h-5 w-5" />
                        Required Documents
                      </h3>
                      <p className="text-orange-700">
                        {admissionSettings.requirements}
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Application Submission
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Please note that admission applications must be submitted physically at our school office. 
                      Download the PDF form, fill it out completely, and visit our campus to submit your application in person.
                    </p>
                    <p className="text-sm text-gray-600">
                      Our admissions team will review your application and contact you within 3-5 business days regarding the next steps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card data-aos="fade-up">
              <CardHeader className="bg-gray-50">
                <CardTitle className="font-playfair text-2xl font-bold text-gray-900">
                  Contact Information & School Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">School Address</h4>
                        <p className="text-gray-600">
                          1. Theo Okeke's Close, Ozuda Market Area,<br />
                          Obosi Anambra State<br />
                          Reg No: 7779525
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Contact Numbers</h4>
                        <p className="text-gray-600">
                          +2348146373297<br />
                          +2347016774165
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Office Hours</h4>
                        <p className="text-gray-600">
                          Monday - Friday: 8:00 AM - 5:00 PM<br />
                          Weekends: Closed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">For Admission Inquiries</h4>
                    <p className="text-gray-700 mb-4">
                      Have questions about the admission process? Our friendly admissions team is here to help!
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Call us:</strong> +2348146373297 or +2347016774165
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> robertsonvocational@gmail.com
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Visit us:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Admission Form (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>
            </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}