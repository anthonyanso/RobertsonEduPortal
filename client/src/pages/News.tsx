import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, User, Tag, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

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

  const categories = [
    { id: "all", label: "All News" },
    { id: "academic", label: "Academic" },
    { id: "sports", label: "Sports" },
    { id: "events", label: "Events" },
    { id: "announcements", label: "Announcements" },
  ];

  const filteredNews = news.filter((item: any) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              News & Updates
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about the latest happenings, achievements, and announcements from Robertson Education.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 md:mb-12" data-aos="fade-up">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-2 rounded-full font-semibold transition-colors text-sm sm:text-base ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-xs sm:max-w-md mx-auto mb-8 md:mb-12" data-aos="fade-up">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {filteredNews.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-xl">No news articles found matching your criteria.</p>
              </div>
            ) : (
              filteredNews.map((item: any, index: number) => (
                <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="w-full h-40 sm:h-48 lg:h-52 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {item.featuredImage ? (
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
                    <ImageIcon className={`h-16 w-16 text-gray-400 fallback-icon ${item.featuredImage ? 'hidden' : ''}`} />
                  </div>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Badge className={`text-xs sm:text-sm ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">{formatDate(item.createdAt)}</span>
                        <span className="sm:hidden">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="font-playfair text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-gray-900 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2 sm:line-clamp-3">
                      {item.excerpt || item.content.substring(0, 120) + "..."}
                    </p>
                    <div className="flex items-center justify-between">
                      {item.author && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="truncate max-w-24 sm:max-w-none">{item.author}</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-4"
                        onClick={() => {
                          setSelectedArticle(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Load More Button */}
          {filteredNews.length > 0 && (
            <div className="text-center mt-12" data-aos="fade-up">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold"
              >
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-playfair font-bold text-gray-900">
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedArticle.featuredImage && (
                <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
                  <img
                    src={selectedArticle.featuredImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(selectedArticle.createdAt)}
                </div>
                {selectedArticle.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {selectedArticle.author}
                  </div>
                )}
                <Badge className={getCategoryColor(selectedArticle.category)}>
                  {selectedArticle.category}
                </Badge>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
