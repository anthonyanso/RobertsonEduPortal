import { useEffect } from "react";
import { Download, FileText, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateAdmissionPDF } from "@/lib/pdfGenerator";

export default function Admission() {
  const handleDownloadPDF = () => {
    // Generate a blank PDF form for download
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
          </div>
        </div>
      </section>
    </div>
  );
}