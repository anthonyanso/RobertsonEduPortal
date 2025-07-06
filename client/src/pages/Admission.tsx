import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, FileText, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateAdmissionPDF } from "@/lib/pdfGenerator";

const admissionFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  preferredStartDate: z.string().min(1, "Preferred start date is required"),
  previousSchool: z.string().optional(),
  previousSchoolAddress: z.string().optional(),
  lastGradeCompleted: z.string().optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  fatherOccupation: z.string().optional(),
  motherOccupation: z.string().optional(),
  guardianPhone: z.string().min(1, "Guardian phone is required"),
  guardianEmail: z.string().email("Valid email is required"),
  medicalConditions: z.string().optional(),
  specialNeeds: z.string().optional(),
  heardAboutUs: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  acceptPrivacy: z.boolean().refine((val) => val === true, "You must accept the privacy policy"),
});

type AdmissionFormData = z.infer<typeof admissionFormSchema>;

export default function Admission() {
  const { toast } = useToast();

  const form = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
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
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AdmissionFormData) => {
      const { acceptTerms, acceptPrivacy, ...formData } = data;
      return await apiRequest("POST", "/api/admission", formData);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your admission application has been submitted successfully. We will contact you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDownloadPDF = () => {
    const formData = form.getValues();
    generateAdmissionPDF(formData);
  };

  const onSubmit = (data: AdmissionFormData) => {
    submitMutation.mutate(data);
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
              Begin your journey with Robertson Education. Complete our comprehensive admission form to take the first step toward excellence.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Form Header */}
            <Card className="mb-8" data-aos="fade-up">
              <CardHeader className="bg-red-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-playfair text-3xl font-bold mb-2">
                      Online Admission Form
                    </CardTitle>
                    <p className="text-yellow-400">Academic Year 2024-2025</p>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="secondary"
                    className="bg-yellow-500 hover:bg-yellow-400 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Form Content */}
            <Card data-aos="fade-up">
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <h3 className="font-playfair text-2xl font-bold text-gray-900 border-b-2 border-yellow-500 pb-2">
                        Personal Information
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                First Name *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter first name" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Last Name *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter last name" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Date of Birth *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Gender *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Nationality *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter nationality" 
                                {...field}
                                className="focus:ring-red-600 focus:border-red-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Home Address *
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter complete home address" 
                                className="focus:ring-red-600 focus:border-red-600"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Academic Information Section */}
                    <div className="space-y-6">
                      <h3 className="font-playfair text-2xl font-bold text-gray-900 border-b-2 border-yellow-500 pb-2">
                        Academic Information
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="gradeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Grade Level Applying For *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                    <SelectValue placeholder="Select grade level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[...Array(12)].map((_, i) => (
                                    <SelectItem key={i + 1} value={`grade-${i + 1}`}>
                                      Grade {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preferredStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Preferred Start Date *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="previousSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Previous School Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter previous school name" 
                                {...field}
                                className="focus:ring-red-600 focus:border-red-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="previousSchoolAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Previous School Address
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter previous school address" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastGradeCompleted"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Last Grade Completed
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter last grade completed" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Parent/Guardian Information Section */}
                    <div className="space-y-6">
                      <h3 className="font-playfair text-2xl font-bold text-gray-900 border-b-2 border-yellow-500 pb-2">
                        Parent/Guardian Information
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Father's Full Name *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter father's full name" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Mother's Full Name *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter mother's full name" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fatherOccupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Father's Occupation
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter father's occupation" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="motherOccupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Mother's Occupation
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter mother's occupation" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="guardianPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Primary Contact Number *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="Enter primary contact number" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="guardianEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Email Address *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="Enter email address" 
                                  {...field}
                                  className="focus:ring-red-600 focus:border-red-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-6">
                      <h3 className="font-playfair text-2xl font-bold text-gray-900 border-b-2 border-yellow-500 pb-2">
                        Additional Information
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="medicalConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Medical Conditions or Allergies
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please list any medical conditions or allergies"
                                className="focus:ring-red-600 focus:border-red-600"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialNeeds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Special Needs or Accommodations
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe any special needs or accommodations required"
                                className="focus:ring-red-600 focus:border-red-600"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="heardAboutUs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              How did you hear about Robertson Education?
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="focus:ring-red-600 focus:border-red-600">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="friend">Friend/Family Referral</SelectItem>
                                <SelectItem value="online">Online Search</SelectItem>
                                <SelectItem value="social">Social Media</SelectItem>
                                <SelectItem value="advertisement">Advertisement</SelectItem>
                                <SelectItem value="event">School Event</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-gray-700">
                                I agree to the{" "}
                                <a href="#" className="text-red-600 hover:underline">
                                  terms and conditions
                                </a>{" "}
                                and confirm that all information provided is accurate and complete. *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="acceptPrivacy"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-gray-700">
                                I consent to the processing of my personal data in accordance with the{" "}
                                <a href="#" className="text-red-600 hover:underline">
                                  privacy policy
                                </a>
                                . *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center pt-8">
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-full text-lg font-semibold transition-colors transform hover:scale-105"
                      >
                        {submitMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
