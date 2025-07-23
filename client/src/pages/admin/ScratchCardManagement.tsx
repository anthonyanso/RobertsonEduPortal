import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Settings, Trash2, RefreshCw, Ban, Eye, EyeOff, Copy, Printer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ScratchCard } from "@shared/schema";
import { generateProfessionalScratchCardTemplate } from './ScratchCardTemplates';

interface ScratchCardSettings {
  defaultDuration: number;
  cardsPerBatch: number;
}

// PIN masking function
const maskPin = (pin: string) => {
  if (!pin) return "";
  return pin.slice(0, 3) + "****" + pin.slice(-3);
};

// Helper functions
const getStatusBadgeColor = (status: string, expired: boolean) => {
  if (expired) return "bg-red-500 text-white";
  switch (status) {
    case "unused": return "bg-green-500 text-white";
    case "used": return "bg-blue-500 text-white";
    case "expired": return "bg-red-500 text-white";
    case "deactivated": return "bg-gray-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getStatusText = (status: string, expired: boolean) => {
  if (expired) return "Expired";
  switch (status) {
    case "unused": return "Unused";
    case "used": return "Used";
    case "expired": return "Expired";
    case "deactivated": return "Deactivated";
    default: return "Unknown";
  }
};

export default function ScratchCardManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPins, setShowPins] = useState<Record<number, boolean>>({});
  const [bulkCount, setBulkCount] = useState(50);
  const [bulkDuration, setBulkDuration] = useState(3);
  const [settings, setSettings] = useState<ScratchCardSettings>({
    defaultDuration: 3,
    cardsPerBatch: 50
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [printTemplateOpen, setPrintTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [printCount, setPrintCount] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Professional template generator function
  const generateProfessionalTemplate = (cards: ScratchCard[], templateType: string) => {
    
    const getTemplateStyles = (type: string) => {
      const baseStyles = `
        @page { 
          margin: 10mm; 
          size: A4;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .card { 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 5px !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
          }
          .card-grid {
            page-break-inside: auto !important;
          }
          .card-grid .card:nth-child(6n) {
            page-break-after: always !important;
          }
        }
        body { 
          font-family: 'Georgia', serif; 
          margin: 0; 
          padding: 10px; 
          background: white; 
        }
        .page-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #d32f2f;
          padding-bottom: 15px;
        }
        .page-title {
          font-size: 24px;
          color: #d32f2f;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .page-subtitle {
          font-size: 12px;
          color: #666;
          margin: 8px 0;
        }
      `;

      switch (type) {
        case 'standard':
          return baseStyles + `
            .card-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              max-width: 100%;
              margin: 0 auto;
            }
            @media print {
              .card-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
              }
            }
            .card { 
              background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
              border: 2px solid #d32f2f;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact; 
              border-radius: 10px;
              padding: 15px; 
              width: 320px; 
              height: 180px; 
              box-shadow: 0 5px 15px rgba(211, 47, 47, 0.2);
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #d32f2f, #ff5722, #d32f2f);
            }
            .card-header {
              text-align: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e0e0e0;
            }
              margin-right: 10px;
              border-radius: 50%;
              border: 1px solid #d32f2f;
              padding: 3px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              flex-shrink: 0;
            }
            .logo:before {
              content: 'RE';
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              font-weight: bold;
              font-size: 8px;
              color: #d32f2f;
            }
            .school-info {
              flex: 1;
            }
            .school-name {
              font-size: 11px;
              font-weight: bold;
              color: #d32f2f;
              line-height: 1.2;
              margin: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .card-type {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
            .serial-section {
              margin: 8px 0;
            }
            .serial-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 4px;
              font-weight: bold;
            }
            .serial-number {
              font-size: 11px;
              font-weight: bold;
              color: #333;
              font-family: 'Courier New', monospace;
              background: #f0f0f0;
              padding: 5px;
              border-radius: 3px;
            }
            .pin-section {
              background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
              color: white;
              padding: 10px;
              border-radius: 8px;
              text-align: center;
              margin: 8px 0;
              box-shadow: 0 3px 10px rgba(211, 47, 47, 0.3);
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
              border: 2px solid #b71c1c;
            }
            .pin-label {
              font-size: 9px;
              margin-bottom: 5px;
              opacity: 0.9;
              font-weight: bold;
            }
            .pin-code {
              font-size: 16px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
            }
            .card-footer {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #666;
              margin-top: 8px;
            }
            .validity {
              font-weight: bold;
            }
            .watermark {
              position: absolute;
              bottom: 10px;
              right: 15px;
              font-size: 8px;
              color: #ccc;
              transform: rotate(-15deg);
              font-weight: bold;
            }
          `;
          
        case 'premium':
          return baseStyles + `
            .card-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              max-width: 100%;
              margin: 0 auto;
            }
            @media print {
              .card-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
              }
            }
            .card { 
              background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
              border: 3px solid #d32f2f; 
              border-radius: 15px;
              padding: 16px; 
              width: 320px; 
              height: 200px; 
              box-shadow: 0 8px 25px rgba(211, 47, 47, 0.25);
              position: relative;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 12px;
              background: linear-gradient(90deg, #d32f2f, #ff5722, #ffc107, #ff5722, #d32f2f);
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            .card::after {
              content: '';
              position: absolute;
              top: 20px;
              right: 20px;
              width: 60px;
              height: 60px;
              background: radial-gradient(circle, rgba(211, 47, 47, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%);
              border-radius: 50%;
            }
            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e0e0e0;
            }
            .logo {
              width: 40px;
              height: 40px;
              background: #d32f2f;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
              margin-right: 12px;
              border: 2px solid #d32f2f;
              padding: 5px;
              box-shadow: 0 3px 10px rgba(211, 47, 47, 0.3);
            }
            .logo:before {
              content: 'RE';
            }
            .school-info {
              flex: 1;
            }
            .school-name {
              font-size: 12px;
              font-weight: bold;
              color: #d32f2f;
              line-height: 1.2;
              margin: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .card-type {
              font-size: 10px;
              color: #666;
              margin-top: 3px;
              font-style: italic;
            }
            .serial-section {
              margin: 12px 0;
            }
            .serial-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .serial-number {
              font-size: 12px;
              font-weight: bold;
              color: #333;
              font-family: 'Courier New', monospace;
              background: linear-gradient(135deg, #f0f0f0, #e8e8e8);
              padding: 8px;
              border-radius: 6px;
              border: 1px solid #ddd;
            }
            .pin-section {
              background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
              color: white;
              padding: 12px;
              border-radius: 12px;
              text-align: center;
              margin: 12px 0;
              box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
              border: 2px solid #b71c1c;
            }
            .pin-label {
              font-size: 10px;
              margin-bottom: 6px;
              opacity: 0.9;
              font-weight: bold;
            }
            .pin-code {
              font-size: 18px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
            }
            .card-footer {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #666;
              margin-top: 12px;
            }
            .validity {
              font-weight: bold;
            }
            .watermark {
              position: absolute;
              bottom: 12px;
              right: 18px;
              font-size: 10px;
              color: #ccc;
              transform: rotate(-15deg);
              font-weight: bold;
            }
          `;
          
        case 'bulk':
          return baseStyles + `
            @media print {
              .card-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                max-width: 100%;
                margin: 0 auto;
              }
              .card { 
                background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
                page-break-inside: avoid;
                break-inside: avoid;
                margin-bottom: 10px;
              border: 2px solid #d32f2f; 
              border-radius: 8px;
              padding: 10px; 
              width: 220px; 
              height: 150px; 
              box-shadow: 0 5px 15px rgba(211, 47, 47, 0.15);
              position: relative;
              font-size: 10px;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e0e0e0;
            }
            .logo {
              width: 20px;
              height: 20px;
              background: #d32f2f;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              margin-right: 6px;
              flex-shrink: 0;
            }
            .logo:before {
              content: 'RE';
            }
            .school-name {
              font-size: 9px;
              font-weight: bold;
              color: #d32f2f;
              line-height: 1.2;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            .serial-section {
              margin: 8px 0;
            }
            .serial-label {
              font-size: 7px;
              color: #666;
              margin-bottom: 1px;
            }
            .serial-number {
              font-size: 8px;
              font-weight: bold;
              color: #333;
              word-wrap: break-word;
              font-family: 'Courier New', monospace;
            }
            .pin-section {
              background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
              color: white;
              padding: 6px;
              border-radius: 4px;
              text-align: center;
              margin: 6px 0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
              border: 1px solid #b71c1c;
            }
            .pin-label {
              font-size: 6px;
              margin-bottom: 2px;
            }
            .pin-code {
              font-size: 11px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              letter-spacing: 0.5px;
            }
            .card-footer {
              font-size: 6px;
              color: #666;
              margin-top: 6px;
              text-align: center;
              overflow: hidden;
            }
          `;
          
        default:
          return baseStyles + `
            .card-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .card { 
              background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
              border: 2px dashed #d32f2f; 
              border-radius: 12px;
              padding: 18px; 
              width: 320px; 
              height: 200px; 
              box-shadow: 0 8px 20px rgba(211, 47, 47, 0.15);
              position: relative;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #e0e0e0;
            }
            .logo {
              width: 35px;
              height: 35px;
              background: #d32f2f;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              margin-right: 12px;
            }
            .logo:before {
              content: 'RE';
            }
            .school-name {
              font-size: 13px;
              font-weight: bold;
              color: #d32f2f;
              line-height: 1.2;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .serial-section {
              margin: 12px 0;
            }
            .serial-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 3px;
            }
            .serial-number {
              font-size: 12px;
              font-weight: bold;
              color: #333;
              font-family: 'Courier New', monospace;
            }
            .pin-section {
              background: linear-gradient(135deg, #e3f2fd, #bbdefb);
              color: #d32f2f;
              padding: 12px;
              border-radius: 8px;
              text-align: center;
              margin: 12px 0;
              border: 2px solid #d32f2f;
            }
            .pin-label {
              font-size: 10px;
              margin-bottom: 5px;
              color: #666;
            }
            .pin-code {
              font-size: 18px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
            }
            .card-footer {
              font-size: 10px;
              color: #666;
              margin-top: 12px;
            }
            .instructions {
              font-size: 9px;
              color: #999;
              margin-top: 8px;
              line-height: 1.2;
            }
          `;
      }
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Robertson Education - ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Result Checker Cards</title>
        <style>
          ${getTemplateStyles(templateType)}
        </style>
      </head>
      <body>
        <div class="page-header">
          <h1 class="page-title">Robertson Education</h1>
          <p class="page-subtitle">Official Student Result Access Cards - ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template</p>
        </div>
        <div class="card-grid">
          ${cards.map(card => `
            <div class="card">
              <div class="card-header">

                <div class="school-info">
                  <div class="school-name">ROBERTSON EDUCATION</div>
                  <div class="card-type">Official Result Access Card</div>
                </div>
              </div>
              <div class="serial-section">
                <div class="serial-label">SERIAL NUMBER</div>
                <div class="serial-number">${card.serialNumber}</div>
              </div>
              <div class="pin-section">
                <div class="pin-label">ACCESS PIN</div>
                <div class="pin-code">${card.pin}</div>
              </div>
              <div class="card-footer">
                <div class="validity">Valid until: ${new Date(card.expiryDate).toLocaleDateString()}</div>
                <div>Uses: ${card.usageCount || 0}/${maxUsage}</div>
              </div>
              ${templateType === 'custom' ? `
                <div class="instructions">
                  <p>1. Visit school website</p>
                  <p>2. Go to Results section</p>
                  <p>3. Enter PIN to view results</p>
                </div>
              ` : ''}
              <div class="watermark">OFFICIAL</div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  };

  // Handle card selection
  const handleCardSelection = (cardId: number) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredScratchCards.map(card => card.id));
    }
    setSelectAll(!selectAll);
  };

  // Get selected cards for printing
  const getSelectedCardsForPrint = () => {
    if (selectedCards.length === 0) {
      return filteredScratchCards.slice(0, printCount);
    }
    return filteredScratchCards.filter(card => selectedCards.includes(card.id));
  };

  // Fetch scratch cards
  const { data: scratchCards = [], isLoading } = useQuery<ScratchCard[]>({
    queryKey: ['/api/admin/scratch-cards'],
  });

  // Fetch settings from school info (same as Settings page)
  const { data: currentSettings = [] } = useQuery({
    queryKey: ["/api/admin/school-info"],
  });

  // Create settings object from array
  const settingsMap = currentSettings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  // Get dynamic max usage from settings
  const maxUsage = parseInt(settingsMap.max_scratch_card_usage) || 30;
  
  // Fetch settings for backwards compatibility
  const { data: settingsData } = useQuery({
    queryKey: ['/api/admin/scratch-card-settings'],
    select: (data: any) => {
      const defaultDuration = data.find((s: any) => s.key === 'scratch_card_default_duration')?.value || '3';
      const cardsPerBatch = data.find((s: any) => s.key === 'scratch_card_batch_size')?.value || '50';
      return {
        defaultDuration: parseInt(defaultDuration),
        cardsPerBatch: parseInt(cardsPerBatch)
      };
    }
  });

  // Update local settings when data loads
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
      setBulkCount(settingsData.cardsPerBatch);
      setBulkDuration(settingsData.defaultDuration);
    }
  }, [settingsData]);

  // Generate cards mutation
  const generateCardsMutation = useMutation({
    mutationFn: async ({ count, durationMonths }: { count: number; durationMonths: number }) => {
      return await apiRequest("POST", "/api/admin/scratch-cards/generate", { 
        count, 
        durationMonths, 
        maxUsage 
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scratch cards generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate scratch cards",
        variant: "destructive",
      });
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/scratch-cards/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scratch card deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete scratch card",
        variant: "destructive",
      });
    },
  });

  // Update card status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/scratch-cards/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scratch card status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update scratch card status",
        variant: "destructive",
      });
    },
  });

  // Regenerate PIN mutation
  const regeneratePinMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/admin/scratch-cards/${id}/regenerate-pin`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PIN regenerated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-cards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to regenerate PIN",
        variant: "destructive",
      });
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: ScratchCardSettings) => {
      await apiRequest("POST", "/api/admin/scratch-card-settings", newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
      setSettingsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scratch-card-settings"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });



  // Check if card is expired
  const isCardExpired = (card: ScratchCard) => {
    return new Date(card.expiryDate) < new Date();
  };

  // Toggle PIN visibility
  const togglePinVisibility = (cardId: number) => {
    setShowPins(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Copy PIN to clipboard
  const copyPinToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin).then(() => {
      toast({
        title: "Copied!",
        description: "PIN copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy PIN",
        variant: "destructive",
      });
    });
  };

  // Handle bulk generation
  const handleBulkGenerate = () => {
    if (bulkCount < 1 || bulkCount > 1000) {
      toast({
        title: "Error",
        description: "Card count must be between 1 and 1000",
        variant: "destructive",
      });
      return;
    }
    if (bulkDuration < 3) {
      toast({
        title: "Error",
        description: "Duration must be at least 3 months",
        variant: "destructive",
      });
      return;
    }
    generateCardsMutation.mutate({ count: bulkCount, durationMonths: bulkDuration });
  };

  // Handle settings save
  const handleSettingsSave = () => {
    if (settings.defaultDuration < 3) {
      toast({
        title: "Error",
        description: "Default duration must be at least 3 months",
        variant: "destructive",
      });
      return;
    }
    if (settings.cardsPerBatch < 1 || settings.cardsPerBatch > 1000) {
      toast({
        title: "Error",
        description: "Cards per batch must be between 1 and 1000",
        variant: "destructive",
      });
      return;
    }
    saveSettingsMutation.mutate(settings);
  };

  // Filter scratch cards based on search term and status
  const filteredScratchCards = scratchCards.filter(card => {
    const matchesSearch = !searchTerm || 
      card.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.pin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.studentId && card.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'expired' && (card.status === 'expired' || isCardExpired(card))) ||
      (statusFilter === 'unused' && card.status === 'unused' && !isCardExpired(card)) ||
      (statusFilter === card.status);
    
    return matchesSearch && matchesStatus;
  });

  // Get card statistics
  const cardStats = {
    total: scratchCards.length,
    unused: scratchCards.filter(c => c.status === "unused" && !isCardExpired(c)).length,
    used: scratchCards.filter(c => c.status === "used").length,
    expired: scratchCards.filter(c => c.status === "expired" || isCardExpired(c)).length,
    deactivated: scratchCards.filter(c => c.status === "deactivated").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Scratch Card Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage scratch cards for student result access</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Dialog open={printTemplateOpen} onOpenChange={setPrintTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Printer className="h-4 w-4 mr-2" />
                Print Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Print Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Card Template</SelectItem>
                      <SelectItem value="premium">Premium Card Template</SelectItem>
                      <SelectItem value="bulk">Bulk Print Template</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="print-count">Number of Cards to Print</Label>
                  <Input
                    id="print-count"
                    type="number"
                    min="1"
                    max="100"
                    value={printCount}
                    onChange={(e) => setPrintCount(parseInt(e.target.value) || 10)}
                    placeholder="Enter number of cards"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedTemplate === 'standard' && 'Clean professional design with school logo and official branding'}
                    {selectedTemplate === 'premium' && 'Enhanced premium layout with larger logo and advanced styling'}
                    {selectedTemplate === 'bulk' && 'Compact 3-column layout optimized for efficient bulk printing'}
                    {selectedTemplate === 'custom' && 'Customizable template with usage instructions and professional appearance'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Will print {selectedCards.length > 0 ? `${selectedCards.length} selected cards` : `first ${printCount} cards`}
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    const cardsToPreview = getSelectedCardsForPrint();
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const htmlContent = generateProfessionalTemplate(cardsToPreview, selectedTemplate);
                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                    }
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={() => {
                    const cardsToPrint = getSelectedCardsForPrint();
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const htmlContent = generateProfessionalTemplate(cardsToPrint, selectedTemplate);
                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }} className="bg-red-600 hover:bg-red-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Print {selectedCards.length > 0 ? `${selectedCards.length} Cards` : `${printCount} Cards`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Scratch Card Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultDuration">Default Duration (months)</Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  min="3"
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="cardsPerBatch">Cards Per Batch</Label>
                <Input
                  id="cardsPerBatch"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.cardsPerBatch}
                  onChange={(e) => setSettings(prev => ({ ...prev, cardsPerBatch: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSettingsSave} disabled={saveSettingsMutation.isPending}>
                  {saveSettingsMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{cardStats.total}</div>
            <div className="text-sm text-gray-600">Total Cards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{cardStats.unused}</div>
            <div className="text-sm text-gray-600">Unused</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{cardStats.used}</div>
            <div className="text-sm text-gray-600">Used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{cardStats.expired}</div>
            <div className="text-sm text-gray-600">Expired</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{cardStats.deactivated}</div>
            <div className="text-sm text-gray-600">Deactivated</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Generate Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="bulkCount">Number of Cards</Label>
              <Input
                id="bulkCount"
                type="number"
                min="1"
                max="1000"
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <div>
              <Label htmlFor="bulkDuration">Duration (months)</Label>
              <Input
                id="bulkDuration"
                type="number"
                min="3"
                value={bulkDuration}
                onChange={(e) => setBulkDuration(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <Button 
              onClick={handleBulkGenerate}
              disabled={generateCardsMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {generateCardsMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Cards
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by serial number or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scratch Cards ({filteredScratchCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">Serial Number</TableHead>
                  <TableHead className="min-w-[100px]">PIN</TableHead>
                  <TableHead className="min-w-[80px] hidden sm:table-cell">Status</TableHead>
                  <TableHead className="min-w-[80px] hidden md:table-cell">Usage</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">Expiry Date</TableHead>
                  <TableHead className="min-w-[120px] hidden xl:table-cell">Bound Student ID</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading scratch cards...
                    </TableCell>
                  </TableRow>
                ) : filteredScratchCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No scratch cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScratchCards.map((card) => {
                    const expired = isCardExpired(card);
                    return (
                      <TableRow key={card.id} className={selectedCards.includes(card.id) ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card.id)}
                            onChange={() => handleCardSelection(card.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{card.serialNumber}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-sm">
                              {showPins[card.id] ? card.pin : maskPin(card.pin)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePinVisibility(card.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showPins[card.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPinToClipboard(card.pin)}
                              className="h-6 w-6 p-0"
                              title="Copy PIN"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={getStatusBadgeColor(card.status, expired)}>
                            {getStatusText(card.status, expired)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{card.usageCount}/{maxUsage}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{formatDate(card.expiryDate)}</TableCell>
                        <TableCell className="hidden xl:table-cell font-mono text-sm">{card.studentId || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {card.status === "unused" && !expired && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: card.id, status: "deactivated" })}
                                disabled={updateStatusMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                            {card.status === "deactivated" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: card.id, status: "unused" })}
                                disabled={updateStatusMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                            {(card.status === "unused" || card.status === "deactivated") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => regeneratePinMutation.mutate(card.id)}
                                disabled={regeneratePinMutation.isPending}
                                className="h-8 w-8 p-0"
                                title="Regenerate PIN"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Scratch Card</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this scratch card? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCardMutation.mutate(card.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}