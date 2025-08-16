import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const { data: coursesResponse } = useQuery({
    queryKey: ['/api/courses']
  });

  const courses = (coursesResponse as any)?.data || [];
  const usersList = (users as any[]) || [];

  const stats = [
    {
      title: "Total Students",
      value: usersList.filter((user: any) => user.role === 'student').length,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Active Instructors",
      value: usersList.filter((user: any) => user.role === 'instructor').length,
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Total Revenue",
      value: "$89,432",
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="title-admin-dashboard">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your e-learning platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersList.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between" data-testid={`user-item-${user.id}`}>
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {usersList.length === 0 && (
                  <p className="text-gray-500 text-center py-4" data-testid="no-users">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.slice(0, 5).map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between" data-testid={`course-item-${course.id}`}>
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">
                        {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
                {courses.length === 0 && (
                  <p className="text-gray-500 text-center py-4" data-testid="no-courses">No courses yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
