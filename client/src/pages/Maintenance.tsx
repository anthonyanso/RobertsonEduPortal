import { Wrench, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full text-center shadow-2xl">
        <CardContent className="pt-16 pb-12 px-8">
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Wrench className="h-12 w-12 text-yellow-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Site Under Maintenance
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're currently performing scheduled maintenance to improve your experience. 
              Our website will be back online shortly.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-lg text-blue-900">What's happening?</h3>
            </div>
            <ul className="text-left space-y-2 text-blue-800">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>System updates and improvements</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Database optimization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Security enhancements</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Estimated completion:</strong> This maintenance should be completed within the next few hours.
            </p>
            <p>
              Thank you for your patience while we work to improve our services.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              For urgent inquiries, please contact us at{" "}
              <a href="mailto:info@robertsoneducation.com" className="text-red-600 hover:underline font-medium">
                info@robertsoneducation.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}