import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Image as ImageIcon, Calendar, User, Eye, Upload, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { News, InsertNews } from "@shared/schema";

const newsFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  published: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type NewsFormData = z.infer<typeof newsFormSchema>;

export default function NewsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      author: "",
      category: "",
      published: true,
      imageUrl: "",
    },
  });

  // Fetch news
  const { data: news = [], isLoading } = useQuery<News[]>({
    queryKey: ["/api/admin/news"],
  });

  // Create news mutation
  const createNewsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('adminToken');
      return await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article created successfully!",
      });
      setIsDialogOpen(false);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
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
        description: "Failed to create news article",
        variant: "destructive",
      });
    },
  });

  // Update news mutation
  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const token = localStorage.getItem('adminToken');
      return await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article updated successfully!",
      });
      setIsDialogOpen(false);
      setEditingNews(null);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
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
        description: "Failed to update news article",
        variant: "destructive",
      });
    },
  });

  // Delete news mutation
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News article deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
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
        description: "Failed to delete news article",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPEG, PNG, or GIF image",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = (data: NewsFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("author", data.author);
    formData.append("category", data.category);
    formData.append("published", data.published.toString());
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  // Handle edit
  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    form.reset({
      title: newsItem.title,
      content: newsItem.content,
      author: newsItem.author,
      category: newsItem.category,
      published: newsItem.published || false,
      imageUrl: newsItem.imageUrl || "",
    });
    if (newsItem.imageUrl) {
      setImagePreview(newsItem.imageUrl);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Handle new article
  const handleNew = () => {
    setEditingNews(null);
    form.reset();
    setImagePreview(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "sports":
        return "bg-green-100 text-green-800";
      case "events":
        return "bg-purple-100 text-purple-800";
      case "announcements":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Truncate content
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">News Management System</h2>
          <p className="text-sm sm:text-base text-gray-600">Create, edit, and manage news articles for your website</p>
        </div>
        <Button onClick={handleNew} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add News Article
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{news.length}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {news.filter(n => n.published).length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {news.filter(n => !n.published).length}
            </div>
            <div className="text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
      </div>

      {/* News Table */}
      <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 sm:w-16">Image</TableHead>
                  <TableHead className="min-w-0">Title</TableHead>
                  <TableHead className="hidden md:table-cell w-20">Author</TableHead>
                  <TableHead className="hidden lg:table-cell w-16">Category</TableHead>
                  <TableHead className="hidden xl:table-cell w-32">Content</TableHead>
                  <TableHead className="hidden sm:table-cell w-16">Status</TableHead>
                  <TableHead className="hidden lg:table-cell w-20">Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading news articles...
                    </TableCell>
                  </TableRow>
                ) : news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No news articles found. Create your first article!
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={`/api/news-image/${item.id}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.classList.add('bg-gray-200');
                                  const icon = parent.querySelector('.fallback-icon');
                                  if (icon) {
                                    icon.classList.remove('hidden');
                                  }
                                }
                              }}
                            />
                          ) : null}
                          <ImageIcon className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 fallback-icon ${item.imageUrl ? 'hidden' : ''}`} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium p-2">
                        <div className="truncate max-w-[120px] sm:max-w-none">{item.title}</div>
                        <div className="text-xs text-gray-500 sm:hidden truncate">{item.author}</div>
                        <div className="text-xs text-gray-500 lg:hidden">
                          <Badge variant={item.published ? "default" : "secondary"} className="text-xs px-1 py-0 sm:hidden">
                            {item.published ? "Pub" : "Draft"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell p-2 truncate">{item.author}</TableCell>
                      <TableCell className="hidden lg:table-cell p-2">
                        <Badge className={`${getCategoryColor(item.category)} text-xs px-2 py-1`}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell p-2">
                        <div className="truncate max-w-[150px]">{truncateContent(item.content, 60)}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell p-2">
                        <Badge variant={item.published ? "default" : "secondary"} className="text-xs">
                          {item.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell p-2 text-xs">{formatDate(item.createdAt || new Date().toISOString())}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete News Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteNewsMutation.mutate(item.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingNews(null);
          form.reset();
          setImagePreview(null);
          setImageFile(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingNews ? "Edit News Article" : "Create New Article"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                          <SelectItem value="announcements">Announcements</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter article content"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Supported formats: JPEG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Publish immediately
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {createNewsMutation.isPending || updateNewsMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {editingNews ? "Update Article" : "Create Article"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}