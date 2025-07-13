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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Settings, Trash2, RefreshCw, Ban, Eye, EyeOff, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ScratchCard } from "@shared/schema";

interface ScratchCardSettings {
  defaultDuration: number;
  cardsPerBatch: number;
}

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
                         card.pin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Check if card is expired
  const isCardExpired = (card: ScratchCard) => {
    return new Date(card.expiryDate) < new Date();
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string, isExpired: boolean) => {
    if (isExpired) return "bg-red-100 text-red-800";
    switch (status) {
      case "unused": return "bg-green-100 text-green-800";
      case "used": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      case "deactivated": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status display text
  const getStatusText = (status: string, isExpired: boolean) => {
    if (isExpired && status !== "expired") return "Expired";
    switch (status) {
      case "unused": return "Unused";
      case "used": return "Used";
      case "expired": return "Expired";
      case "deactivated": return "Deactivated";
      default: return status;
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scratch Card Management</h2>
          <p className="text-gray-600">Manage scratch cards for student result access</p>
        </div>
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
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
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) || 3 }))}
                />
                <p className="text-sm text-gray-500 mt-1">Minimum 3 months</p>
              </div>
              <div>
                <Label htmlFor="cardsPerBatch">Default Cards per Batch</Label>
                <Input
                  id="cardsPerBatch"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.cardsPerBatch}
                  onChange={(e) => setSettings(prev => ({ ...prev, cardsPerBatch: parseInt(e.target.value) || 50 }))}
                />
                <p className="text-sm text-gray-500 mt-1">Between 1 and 1000</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSettingsSave} disabled={saveSettingsMutation.isPending}>
                  {saveSettingsMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{cardStats.total}</div>
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
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Generate Scratch Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div>
              <Label htmlFor="bulkCount">Number of Cards</Label>
              <Input
                id="bulkCount"
                type="number"
                min="1"
                max="1000"
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
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
                onChange={(e) => setBulkDuration(parseInt(e.target.value) || 3)}
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
                placeholder="Search by serial number or PIN..."
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
                  <TableHead>Used By</TableHead>
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
                              {showPins[card.id] ? card.pin : '•'.repeat(card.pin.length)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePinVisibility(card.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showPins[card.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
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
                        <TableCell>{card.usedBy || "—"}</TableCell>
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