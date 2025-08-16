import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/sidebar";
import { CourseForm } from "@/components/course/course-form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Course } from "@/types";

export default function AdminCourses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ['/api/courses']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  const courses = (coursesResponse as any)?.data || [];
  const categoriesList = (categories as any[]) || [];

  const createCourseMutation = useMutation({
    mutationFn: api.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Course created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive"
      });
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Course> }) =>
      api.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setEditingCourse(null);
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: api.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  });

  const handleCreateCourse = async (data: any) => {
    await createCourseMutation.mutateAsync(data);
  };

  const handleUpdateCourse = async (data: any) => {
    if (editingCourse) {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        data
      });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteCourseMutation.mutateAsync(courseId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="title-courses">Courses Management</h1>
            <p className="text-gray-600 mt-2">Manage all courses on your platform</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-course">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <CourseForm 
                categories={categoriesList}
                onSubmit={handleCreateCourse}
                isLoading={createCourseMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-courses">
                {courses.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-published-courses">
                {courses.filter((course: Course) => course.isPublished).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-draft-courses">
                {courses.filter((course: Course) => !course.isPublished).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600" data-testid="stat-categories">
                {categoriesList.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: Course) => (
                    <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`title-${course.id}`}>
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.level} • {course.language}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`category-${course.id}`}>
                        <Badge variant="outline">
                          {course.category?.name || 'No category'}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`instructor-${course.id}`}>
                        {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={course.isPublished ? "default" : "secondary"}
                          data-testid={`status-${course.id}`}
                        >
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`students-${course.id}`}>
                        {course.studentCount.toLocaleString()}
                      </TableCell>
                      <TableCell data-testid={`created-${course.id}`}>
                        {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                            data-testid={`button-view-${course.id}`}
                          >
                            <Link href={`/courses/${course.slug}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          
                          <Dialog 
                            open={editingCourse?.id === course.id}
                            onOpenChange={(open) => setEditingCourse(open ? course : null)}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-edit-${course.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Course</DialogTitle>
                              </DialogHeader>
                              <CourseForm 
                                course={course}
                                categories={categoriesList}
                                onSubmit={handleUpdateCourse}
                                isLoading={updateCourseMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            disabled={deleteCourseMutation.isPending}
                            data-testid={`button-delete-${course.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg" data-testid="no-courses-message">No courses found</p>
                <p className="text-gray-400 text-sm mt-2">Create your first course to get started</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  data-testid="button-create-first-course"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
