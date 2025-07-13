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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scratch cards
  const { data: scratchCards = [], isLoading } = useQuery<ScratchCard[]>({
    queryKey: ['/api/admin/scratch-cards'],
  });

  // Fetch settings
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
      return await apiRequest("POST", "/api/admin/scratch-cards/generate", { count, durationMonths });
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

  // Filter and search cards
  const filteredCards = scratchCards.filter(card => {
    const matchesSearch = card.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.studentId && card.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
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
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedTemplate === 'standard' && 'Basic scratch card with PIN and serial number'}
                    {selectedTemplate === 'premium' && 'Enhanced design with school logo and branding'}
                    {selectedTemplate === 'bulk' && 'Multiple cards per page for efficient printing'}
                    {selectedTemplate === 'custom' && 'Customizable template with additional fields'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    const sampleCards = filteredScratchCards.slice(0, 6);
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Scratch Card Sample - ${selectedTemplate}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .card { border: 2px solid #333; padding: 20px; margin: 20px; width: 300px; height: 200px; display: inline-block; }
                            .header { text-align: center; font-weight: bold; color: #d32f2f; }
                            .serial { font-size: 14px; margin: 10px 0; }
                            .pin { font-size: 20px; font-weight: bold; margin: 15px 0; }
                            .footer { font-size: 12px; text-align: center; color: #666; }
                          </style>
                        </head>
                        <body>
                          <h2>Robertson Education - Sample ${selectedTemplate} Template</h2>
                          ${sampleCards.map(card => `
                            <div class="card">
                              <div class="header">ROBERTSON EDUCATION</div>
                              <div class="serial">Serial: ${card.serialNumber}</div>
                              <div class="pin">PIN: ${card.pin}</div>
                              <div class="footer">
                                <p>Valid until: ${new Date(card.expiryDate).toLocaleDateString()}</p>
                                <p>For result checking only</p>
                              </div>
                            </div>
                          `).join('')}
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={() => window.print()} className="bg-red-600 hover:bg-red-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
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
          <CardTitle>Scratch Cards ({filteredCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Bound Student ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading scratch cards...
                    </TableCell>
                  </TableRow>
                ) : filteredCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No scratch cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCards.map((card) => {
                    const expired = isCardExpired(card);
                    return (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono">{card.serialNumber}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center space-x-2">
                            <span>
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
                        <TableCell>
                          <Badge className={getStatusBadgeColor(card.status, expired)}>
                            {getStatusText(card.status, expired)}
                          </Badge>
                        </TableCell>
                        <TableCell>{card.usageCount}/{card.usageLimit}</TableCell>
                        <TableCell>{formatDate(card.expiryDate)}</TableCell>
                        <TableCell className="font-mono">{card.studentId || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {card.status === "unused" && !expired && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: card.id, status: "deactivated" })}
                                disabled={updateStatusMutation.isPending}
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
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
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