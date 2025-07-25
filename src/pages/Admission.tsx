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
    queryKey: ["/api/school-info"],
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data for feature toggles
  });

  const settingsMap = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const isAdmissionsEnabled = settingsMap.enable_admissions === 'true';
  const isAdmissionsOpen = admissionSettings?.isOpen || false;
  
  // Check both feature toggle AND admission open status
  const shouldShowAdmissionForm = isAdmissionsEnabled && isAdmissionsOpen;
  
  // Debug logging
  console.log('Settings data:', settings);
  console.log('Settings map:', settingsMap);
  console.log('enable_admissions value:', settingsMap.enable_admissions);
  console.log('isAdmissionsEnabled:', isAdmissionsEnabled);
  console.log('admissionSettings:', admissionSettings);
  console.log('isAdmissionsOpen:', isAdmissionsOpen);
  console.log('shouldShowAdmissionForm:', shouldShowAdmissionForm);

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Admission Application
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Begin your journey with Robertson Education. Follow the steps below to apply for admission.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {!shouldShowAdmissionForm ? (
              <Card className="mb-6 md:mb-8" data-aos="fade-up">
                <CardContent className="p-6 md:p-8">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 text-base md:text-lg">
                      {!isAdmissionsEnabled ? "Admissions Disabled" : "Admissions Closed"}
                    </AlertTitle>
                    <AlertDescription className="text-red-700 text-sm md:text-base">
                      {!isAdmissionsEnabled 
                        ? "The admission system is currently disabled by the school administrator. Please contact the school office for information about current enrollment or check back later."
                        : "Admission applications are currently closed. Please check back during the next admission period or contact the school office for more information."
                      }
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Application Process */}
            <Card className="mb-8" data-aos="fade-up">
              <CardHeader className="bg-red-600 text-white rounded-t-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-playfair text-2xl md:text-3xl font-bold mb-2">
                      Admission Application Process
                    </CardTitle>
                    <p className="text-yellow-400 text-sm md:text-base">Academic Year 2024-2025</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="secondary"
                      className="bg-yellow-500 hover:bg-yellow-400 text-white w-full lg:w-auto text-sm md:text-base px-3 md:px-4 py-2"
                    >
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">Download Form (PDF)</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Application Instructions */}
            <Card className="mb-6 md:mb-8" data-aos="fade-up">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="text-center mb-6 md:mb-8">
                    <FileText className="h-12 md:h-16 w-12 md:w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                      How to Apply for Admission
                    </h2>
                    <p className="text-base md:text-lg text-gray-600">
                      Follow these simple steps to complete your admission application
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-xl font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Download Form</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Click the "Download Form (PDF)" button above to get the official application form
                      </p>
                    </div>

                    <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-xl font-bold">
                        2
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Fill Out Form</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Complete all sections of the admission form with accurate information
                      </p>
                    </div>

                    <div className="text-center p-4 md:p-6 bg-gray-50 rounded-lg">
                      <div className="bg-red-600 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-xl font-bold">
                        3
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Submit in Person</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Bring the completed form to our school office for physical submission
                      </p>
                    </div>
                  </div>

                  {/* Admission Status */}
                  {admissionSettings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                        <h3 className="font-semibold text-green-800 text-sm md:text-base">Admission Status</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-green-700">
                            Application Period: {new Date(admissionSettings.startDate).toLocaleDateString()} - {new Date(admissionSettings.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-green-700">
                            Maximum Applications: {admissionSettings.maxApplications}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-green-700">
                            Application Fee: ₦{admissionSettings.applicationFee?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Classes */}
                  {admissionSettings && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <h3 className="font-semibold text-blue-800 mb-3 md:mb-4 text-sm md:text-base">Available Classes</h3>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {admissionSettings.availableClasses.map((cls: string) => (
                          <Badge key={cls} variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs md:text-sm px-2 py-1">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {admissionSettings && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <h3 className="font-semibold text-orange-800 mb-3 text-sm md:text-base">
                        <FileText className="inline-block mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Required Documents
                      </h3>
                      <p className="text-orange-700 text-xs md:text-sm leading-relaxed">
                        {admissionSettings.requirements}
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm md:text-base">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
                      Application Submission
                    </h3>
                    <p className="text-gray-700 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed">
                      Please note that admission applications must be submitted physically at our school office. 
                      Download the PDF form, fill it out completely, and visit our campus to submit your application in person.
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Our admissions team will review your application and contact you within 3-5 business days regarding the next steps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card data-aos="fade-up">
              <CardHeader className="bg-gray-50">
                <CardTitle className="font-playfair text-xl md:text-2xl font-bold text-gray-900">
                  Contact Information & School Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 lg:p-8">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">School Address</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                          1. Theo Okeke's Close, Ozuda Market Area,<br />
                          Obosi Anambra State<br />
                          Reg No: 7779525
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Contact Numbers</h4>
                        <p className="text-gray-600 text-xs md:text-sm">
                          +2348146373297<br />
                          +2347016774165
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Office Hours</h4>
                        <p className="text-gray-600 text-xs md:text-sm">
                          Monday - Friday: 8:00 AM - 5:00 PM<br />
                          Weekends: Closed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 md:p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">For Admission Inquiries</h4>
                    <p className="text-gray-700 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed">
                      Have questions about the admission process? Our friendly admissions team is here to help!
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm text-gray-600">
                        <strong>Call us:</strong> +2348146373297 or +2347016774165
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        <strong>Email:</strong> robertsonvocational@gmail.com
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        <strong>Visit us:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 text-center">
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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