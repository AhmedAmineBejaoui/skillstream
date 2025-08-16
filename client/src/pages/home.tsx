import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { CourseCard } from "@/components/course/course-card";
import { api } from "@/lib/api";
import { Code, TrendingUp, Palette, Briefcase, Megaphone, Camera } from "lucide-react";

const categoryIcons = {
  "web-development": Code,
  "data-science": TrendingUp,
  "design": Palette,
  "business": Briefcase,
  "marketing": Megaphone,
  "photography": Camera
};

const categoryColors = {
  "web-development": "bg-blue-50 text-blue-600 hover:bg-blue-100",
  "data-science": "bg-green-50 text-green-600 hover:bg-green-100",
  "design": "bg-purple-50 text-purple-600 hover:bg-purple-100",
  "business": "bg-orange-50 text-orange-600 hover:bg-orange-100",
  "marketing": "bg-pink-50 text-pink-600 hover:bg-pink-100",
  "photography": "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
};

export default function Home() {
  const { data: categoriesResponse } = useQuery<{ data: any[] }>({
    queryKey: ['/api/categories']
  });

  const { data: coursesResponse } = useQuery<{ data: any[] }>({
    queryKey: ['/api/courses'],
    retry: false
  });

  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : 
                   Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const courses = Array.isArray(coursesResponse?.data) ? coursesResponse.data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div 
          className="absolute inset-0 bg-black bg-opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master New Skills with <span className="text-yellow-300">Expert Instruction</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join thousands of learners advancing their careers through our comprehensive courses in technology, business, and creative skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4" data-testid="button-explore-courses">
                <Link href="/courses">Explore Courses</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4" data-testid="button-become-instructor">
                <Link href="/become-instructor">Become an Instructor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose from our most popular learning categories to start your journey</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.length > 0 ? categories.slice(0, 6).map((category: any) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Code;
              const colorClass = categoryColors[category.slug as keyof typeof categoryColors] || "bg-blue-50 text-blue-600 hover:bg-blue-100";
              
              return (
                <Card key={category.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300" data-testid={`card-category-${category.slug}`}>
                  <CardContent className={`${colorClass} p-6 text-center transition-colors`}>
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold mb-2" data-testid={`title-${category.slug}`}>{category.name}</h3>
                    <p className="text-sm opacity-75" data-testid={`count-${category.slug}`}>
                      {Math.floor(Math.random() * 1000) + 100} courses
                    </p>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No categories available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
              <p className="text-lg text-gray-600">Hand-picked courses by our education experts</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex" data-testid="button-view-all">
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.slice(0, 8).map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No courses available yet.</p>
              <Button asChild className="mt-4" data-testid="button-create-course">
                <Link href="/admin/courses/new">Create First Course</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">EasywaysSkills</h3>
              <p className="text-gray-300 mb-6">Empowering learners worldwide with high-quality, affordable education that leads to real career advancement.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/courses" className="text-gray-300 hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/instructors" className="text-gray-300 hover:text-white transition-colors">Instructors</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.length > 0 && categories.slice(0, 5).map((category: any) => (
                  <li key={category.id}>
                    <Link href={`/courses?category=${category.slug}`} className="text-gray-300 hover:text-white transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2024 EasywaysSkills. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
