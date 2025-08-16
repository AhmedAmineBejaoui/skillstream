import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, ShoppingCart } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  showAddToCart?: boolean;
}

export function CourseCard({ course, showAddToCart = true }: CourseCardProps) {
  const pricing = course.pricing?.find(p => p.tier === 'basic') || course.pricing?.[0];
  
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-testid={`card-course-${course.id}`}>
      <Link href={`/courses/${course.slug}`}>
        <div className="aspect-video overflow-hidden">
          <img 
            src={course.imageUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225'} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: course.category?.color || undefined }}
          >
            {course.category?.name || 'General'}
          </Badge>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold ml-1" data-testid={`rating-${course.id}`}>
              {course.rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 hover:text-primary transition-colors" data-testid={`title-${course.id}`}>
            {course.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm" data-testid={`instructor-${course.id}`}>
          By {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-1" />
          <span data-testid={`duration-${course.id}`}>{formatDuration(course.durationMinutes)}</span>
          <span className="mx-2">•</span>
          <Users className="w-4 h-4 mr-1" />
          <span data-testid={`students-${course.id}`}>{course.studentCount.toLocaleString()} students</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900" data-testid={`price-${course.id}`}>
              ${pricing?.price || 'Free'}
            </span>
            {pricing?.originalPrice && pricing.originalPrice > pricing.price && (
              <span className="text-sm text-gray-500 line-through ml-2" data-testid={`original-price-${course.id}`}>
                ${pricing.originalPrice}
              </span>
            )}
          </div>
          
          {showAddToCart && (
            <Button size="sm" data-testid={`button-add-cart-${course.id}`}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
