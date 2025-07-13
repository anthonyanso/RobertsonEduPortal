import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, User, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              News & Updates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about the latest happenings, achievements, and announcements from Robertson Education.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12" data-aos="fade-up">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
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
          <div className="max-w-md mx-auto mb-12" data-aos="fade-up">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-xl">No news articles found matching your criteria.</p>
              </div>
            ) : (
              filteredNews.map((item: any, index: number) => (
                <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay={index * 100}>
                  {item.featuredImage && (
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <h3 className="font-playfair text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.excerpt || item.content.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center justify-between">
                      {item.author && (
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          {item.author}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
}
