import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/layout/sidebar";
import { formatDistanceToNow } from "date-fns";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users']
  });

  const usersList = (users as any[]) || [];

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'instructor':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="title-users">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage all users on your platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({usersList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {usersList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((user: any) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`name-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell data-testid={`email-${user.id}`}>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} data-testid={`role-${user.id}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`joined-${user.id}`}>
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg" data-testid="no-users-message">No users found</p>
                <p className="text-gray-400 text-sm mt-2">Users will appear here once they register</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
