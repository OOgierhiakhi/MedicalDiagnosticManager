import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  status: string;
  lastLogin: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  department?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: [] as string[],
    department: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch available roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roles: [],
        department: ""
      });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      return apiRequest("PUT", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: selectedUser
      });
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'ceo':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'branch_manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'doctor':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'nurse':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'lab_technician':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      case 'pharmacist':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'cashier':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'receptionist':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'radiologist':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300';
      case 'accountant':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inventory_manager':
        return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/main-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage system users, roles, and permissions
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with appropriate role and permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Roles (Select Multiple)</Label>
                    <div className="space-y-3">
                      {/* Selected Roles Display */}
                      {newUser.roles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newUser.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="flex items-center gap-1">
                              {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => setNewUser({
                                  ...newUser, 
                                  roles: newUser.roles.filter(r => r !== role)
                                })}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Role Selection */}
                      <Select
                        onValueChange={(value) => {
                          if (!newUser.roles.includes(value)) {
                            setNewUser({ ...newUser, roles: [...newUser.roles, value] });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin - Full System Access</SelectItem>
                          <SelectItem value="ceo">CEO - Executive Level</SelectItem>
                          <SelectItem value="branch_manager">Branch Manager - Branch Oversight</SelectItem>
                          <SelectItem value="doctor">Doctor - Medical Staff</SelectItem>
                          <SelectItem value="nurse">Nurse - Clinical Staff</SelectItem>
                          <SelectItem value="receptionist">Receptionist - Front Desk</SelectItem>
                          <SelectItem value="cashier">Cashier - Billing & Payments</SelectItem>
                          <SelectItem value="lab_technician">Lab Technician - Laboratory</SelectItem>
                          <SelectItem value="radiologist">Radiologist - Imaging Services</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist - Pharmacy</SelectItem>
                          <SelectItem value="accountant">Accountant - Financial Records</SelectItem>
                          <SelectItem value="inventory_manager">Inventory Manager - Supply Chain</SelectItem>
                          <SelectItem value="data_entry">Data Entry - Records Management</SelectItem>
                          <SelectItem value="quality_assurance">Quality Assurance - QA/QC</SelectItem>
                          <SelectItem value="consultant">Consultant - External Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={newUser.department}
                      onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>User Directory</span>
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and system access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} className={getRoleColor(role)}>
                                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                No roles assigned
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.department || "Not assigned"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={selectedUser.firstName || ""}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      firstName: e.target.value 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={selectedUser.lastName || ""}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      lastName: e.target.value 
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ 
                    ...selectedUser, 
                    username: e.target.value 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ 
                    ...selectedUser, 
                    email: e.target.value 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Roles (Select Multiple)</Label>
                <div className="space-y-3">
                  {/* Selected Roles Display */}
                  {selectedUser.roles && selectedUser.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="flex items-center gap-1">
                          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => setSelectedUser({
                              ...selectedUser, 
                              roles: selectedUser.roles.filter(r => r !== role)
                            })}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Role Selection */}
                  <Select
                    onValueChange={(value) => {
                      const currentRoles = selectedUser.roles || [];
                      if (!currentRoles.includes(value)) {
                        setSelectedUser({ 
                          ...selectedUser, 
                          roles: [...currentRoles, value] 
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full System Access</SelectItem>
                      <SelectItem value="ceo">CEO - Executive Level</SelectItem>
                      <SelectItem value="branch_manager">Branch Manager - Branch Oversight</SelectItem>
                      <SelectItem value="doctor">Doctor - Medical Staff</SelectItem>
                      <SelectItem value="nurse">Nurse - Clinical Staff</SelectItem>
                      <SelectItem value="receptionist">Receptionist - Front Desk</SelectItem>
                      <SelectItem value="cashier">Cashier - Billing & Payments</SelectItem>
                      <SelectItem value="lab_technician">Lab Technician - Laboratory</SelectItem>
                      <SelectItem value="radiologist">Radiologist - Imaging Services</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist - Pharmacy</SelectItem>
                      <SelectItem value="accountant">Accountant - Financial Records</SelectItem>
                      <SelectItem value="inventory_manager">Inventory Manager - Supply Chain</SelectItem>
                      <SelectItem value="data_entry">Data Entry - Records Management</SelectItem>
                      <SelectItem value="quality_assurance">Quality Assurance - QA/QC</SelectItem>
                      <SelectItem value="consultant">Consultant - External Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Select
                  value={selectedUser.department || ""}
                  onValueChange={(value) => setSelectedUser({ 
                    ...selectedUser, 
                    department: value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="reception">Reception</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}