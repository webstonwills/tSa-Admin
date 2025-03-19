import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, UserCheck, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { notify } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Define types for our component
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department_id: string | null;
  approval_status: string;
  created_at: string;
  rejection_reason?: string;
  approval_date?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
  };
}

interface Department {
  id: string;
  name: string;
  department_code: string;
}

const RegistrationApproval = () => {
  // State for users, departments, loading status, selected user, and dialog visibility
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  // Available roles for assignment
  const availableRoles = [
    { value: 'secretary', label: 'Secretary' },
    { value: 'finance', label: 'Finance' },
    { value: 'business_management', label: 'Business Management' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'welfare', label: 'Welfare' },
    { value: 'board_member', label: 'Board Member' },
  ];

  // Fetch all users and departments on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch all users with pending approval status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch all departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (departmentsError) {
        throw departmentsError;
      }

      // Separate users by approval status
      const pending = profiles.filter(user => user.approval_status === 'pending');
      const approved = profiles.filter(user => user.approval_status === 'approved');
      const rejected = profiles.filter(user => user.approval_status === 'rejected');

      setPendingUsers(pending);
      setApprovedUsers(approved);
      setRejectedUsers(rejected);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error fetching registration data:', error);
      notify.error('Failed to load registration data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Function to handle user approval
  const handleApprove = async () => {
    if (!selectedUser || !selectedDepartment || !selectedRole) {
      notify.warning('Please select a department and role');
      return;
    }

    setActionLoading(true);

    try {
      console.log('Debug: Starting approval process for user', selectedUser.id);
      console.log('Debug: Selected department:', selectedDepartment);
      console.log('Debug: Selected role:', selectedRole);
      
      // Get the department code for the selected department
      const departmentCode = departments.find(d => d.id === selectedDepartment)?.department_code || '';
      console.log('Debug: Department code:', departmentCode);

      // Get current user as the approver
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const approverId = currentUser?.id;
      console.log('Debug: Approver ID:', approverId);

      // First try the direct update approach
      console.log('Debug: Attempting direct database update');
      
      // Use a more reliable approach - direct SQL for administrators
      const { data: updateResult, error: updateError } = await supabase.rpc('approve_user', {
        user_id: selectedUser.id,
        dept_id: selectedDepartment,
        user_role: selectedRole,
        approver: approverId
      });
      
      if (updateError) {
        console.error('Debug: RPC error:', updateError);
        
        // Fallback to direct update if RPC isn't available
        console.log('Debug: Falling back to direct update');
        
        const { data: directResult, error: directError } = await supabase
          .from('profiles')
          .update({
            approval_status: 'approved',
            department_id: selectedDepartment,
            role: selectedRole,
            approved_by: approverId,
            approval_date: new Date().toISOString()
          })
          .eq('id', selectedUser.id)
          .select();
          
        if (directError) {
          console.error('Debug: Direct update error:', directError);
          throw directError;
        }
        
        console.log('Debug: Direct update result:', directResult);
      } else {
        console.log('Debug: RPC update successful:', updateResult);
      }
      
      // Verify the update worked by checking the user's current status
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedUser.id)
        .single();
        
      if (verifyError) {
        console.error('Debug: Verification query error:', verifyError);
      } else {
        console.log('Debug: Verification result:', verifyData);
        if (verifyData.approval_status !== 'approved') {
          console.error('Debug: Verification failed - user still not approved in database');
          
          // As a last resort, try a raw SQL update
          const { error: rawError } = await supabase.rpc('manual_approval_update', {
            p_user_id: selectedUser.id,
            p_status: 'approved',
            p_department_id: selectedDepartment,
            p_role: selectedRole
          });
          
          if (rawError) {
            console.error('Debug: Raw SQL update failed:', rawError);
            throw new Error('Could not update user approval status after multiple attempts');
          } else {
            console.log('Debug: Raw SQL update succeeded');
          }
        }
      }

      // Update the local state
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setApprovedUsers(prevUsers => [...prevUsers, {
        ...selectedUser,
        approval_status: 'approved',
        department_id: selectedDepartment,
        role: selectedRole,
        approval_date: new Date().toISOString()
      }]);

      // Change to activeTab "approved" to show the newly approved user
      setActiveTab('approved');

      notify.success('User approved successfully', {
        description: `${selectedUser.first_name} ${selectedUser.last_name} is now approved`
      });

      // Reset selection and close dialog
      setSelectedUser(null);
      setSelectedDepartment('');
      setSelectedRole('');
      setShowApproveDialog(false);
      
      // Refresh the data to confirm changes
      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
      notify.error('Failed to approve user', {
        description: 'Database update failed. Check console for details.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Function to handle user rejection
  const handleReject = async () => {
    if (!selectedUser) {
      notify.warning('No user selected');
      return;
    }

    if (!rejectionReason.trim()) {
      notify.warning('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);

    try {
      console.log('Debug: Starting rejection process for user', selectedUser.id);
      console.log('Debug: Rejection reason:', rejectionReason);
      
      // Get current user as the approver/rejecter
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const approverId = currentUser?.id;
      console.log('Debug: Rejecter ID:', approverId);

      // First try the direct update approach
      console.log('Debug: Attempting direct database update');
      
      // Use a more reliable approach - direct SQL for administrators
      const { data: updateResult, error: updateError } = await supabase.rpc('reject_user', {
        user_id: selectedUser.id,
        reason: rejectionReason,
        approver: approverId
      });
      
      if (updateError) {
        console.error('Debug: RPC error:', updateError);
        
        // Fallback to direct update if RPC isn't available
        console.log('Debug: Falling back to direct update');
        
        const { data: directResult, error: directError } = await supabase
          .from('profiles')
          .update({
            approval_status: 'rejected',
            rejection_reason: rejectionReason,
            approved_by: approverId,
            approval_date: new Date().toISOString()
          })
          .eq('id', selectedUser.id)
          .select();
          
        if (directError) {
          console.error('Debug: Direct update error:', directError);
          throw directError;
        }
        
        console.log('Debug: Direct update result:', directResult);
      } else {
        console.log('Debug: RPC update successful:', updateResult);
      }
      
      // Verify the update worked by checking the user's current status
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedUser.id)
        .single();
        
      if (verifyError) {
        console.error('Debug: Verification query error:', verifyError);
      } else {
        console.log('Debug: Verification result:', verifyData);
        if (verifyData.approval_status !== 'rejected') {
          console.error('Debug: Verification failed - user still not rejected in database');
          
          // As a last resort, try a raw SQL update
          const { error: rawError } = await supabase.rpc('manual_rejection_update', {
            p_user_id: selectedUser.id,
            p_reason: rejectionReason
          });
          
          if (rawError) {
            console.error('Debug: Raw SQL update failed:', rawError);
            throw new Error('Could not update user rejection status after multiple attempts');
          } else {
            console.log('Debug: Raw SQL update succeeded');
          }
        }
      }

      // Update the local state
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setRejectedUsers(prevUsers => [...prevUsers, {
        ...selectedUser,
        approval_status: 'rejected',
        rejection_reason: rejectionReason,
        approval_date: new Date().toISOString()
      }]);

      // Change to activeTab "rejected" to show the newly rejected user
      setActiveTab('rejected');

      notify.success('User rejected', {
        description: `${selectedUser.first_name} ${selectedUser.last_name} has been rejected`
      });

      // Reset selection and close dialog
      setSelectedUser(null);
      setRejectionReason('');
      setShowRejectDialog(false);
      
      // Refresh the data to confirm changes
      fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      notify.error('Failed to reject user', {
        description: 'Database update failed. Check console for details.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users based on search term
  const filterUsers = (users: User[]) => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render the component
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 md:py-6 px-3 md:px-6 space-y-5">
        {/* Header section with responsive adjustments */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Registration Approval</h1>
            <p className="text-sm text-muted-foreground">
              Manage user registrations and assign departments
            </p>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 flex gap-2">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="shrink-0"
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading registrations...</span>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-0 p-4">
              <Tabs 
                defaultValue="pending" 
                className="w-full" 
                value={activeTab} 
                onValueChange={setActiveTab}
              >
                <div className="flex items-center justify-between">
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                    <TabsTrigger value="pending" className="relative">
                      Pending
                      {filterUsers(pendingUsers).length > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                        >
                          {filterUsers(pendingUsers).length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved
                      {filterUsers(approvedUsers).length > 0 && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({filterUsers(approvedUsers).length})
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected
                      {filterUsers(rejectedUsers).length > 0 && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({filterUsers(rejectedUsers).length})
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Pending Approvals Tab Content */}
                <TabsContent value="pending" className="mt-4 p-0">
                  <div className="block md:hidden">
                    {filterUsers(pendingUsers).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No pending approvals at this time
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filterUsers(pendingUsers).map((user) => (
                          <div key={user.id} className="p-4 space-y-3">
                            <div className="flex justify-between">
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm">{user.email}</div>
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-50 h-9 px-3 py-1 text-xs flex-1"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowApproveDialog(true);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-600 hover:bg-red-50 h-9 px-3 py-1 text-xs flex-1"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop table view */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Requested On</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(pendingUsers).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                              No pending approvals at this time
                            </TableCell>
                          </TableRow>
                        ) : (
                          filterUsers(pendingUsers).map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.first_name} {user.last_name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowApproveDialog(true);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Approved Users Tab Content */}
                <TabsContent value="approved" className="mt-4 p-0">
                  <div className="block md:hidden">
                    {filterUsers(approvedUsers).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No approved users found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filterUsers(approvedUsers).map((user) => {
                          const department = departments.find(d => d.id === user.department_id);
                          return (
                            <div key={user.id} className="p-4 space-y-2">
                              <div className="flex justify-between">
                                <div className="font-medium truncate mr-2">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full whitespace-nowrap">
                                  {user.role || 'No role'}
                                </div>
                              </div>
                              <div className="text-sm truncate">{user.email}</div>
                              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <div>Dept: {department?.name || 'None'}</div>
                                <div>
                                  {user.approval_date ? new Date(user.approval_date).toLocaleDateString() : 'Unknown'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop table for approved users */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Approved On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(approvedUsers).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                              No approved users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filterUsers(approvedUsers).map((user) => {
                            const department = departments.find(d => d.id === user.department_id);
                            return (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                  {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="capitalize">{user.role || 'Not assigned'}</TableCell>
                                <TableCell>{department?.name || 'None'}</TableCell>
                                <TableCell>
                                  {user.approval_date ? new Date(user.approval_date).toLocaleString() : 'Unknown'}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Rejected Applications Tab Content */}
                <TabsContent value="rejected" className="mt-4 p-0">
                  <div className="block md:hidden">
                    {filterUsers(rejectedUsers).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No rejected applications
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filterUsers(rejectedUsers).map((user) => (
                          <div key={user.id} className="p-4 space-y-2">
                            <div className="flex justify-between">
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.approval_date ? new Date(user.approval_date).toLocaleDateString() : 'Unknown'}
                              </div>
                            </div>
                            <div className="text-sm">{user.email}</div>
                            {user.rejection_reason && (
                              <div className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-100">
                                <div className="font-medium text-red-800 mb-1">Rejection reason:</div>
                                <div className="text-gray-600">{user.rejection_reason}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop table for rejected users */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rejected On</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterUsers(rejectedUsers).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                              No rejected applications
                            </TableCell>
                          </TableRow>
                        ) : (
                          filterUsers(rejectedUsers).map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.first_name} {user.last_name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.approval_date ? new Date(user.approval_date).toLocaleString() : 'Unknown'}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {user.rejection_reason || 'No reason provided'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        )}

        {/* Mobile-optimized dialog for approval */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
            <DialogHeader className="mb-2">
              <DialogTitle>Approve User</DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Assign a department and role
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">User Information</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="text-muted-foreground text-xs">Name:</div>
                    <div className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</div>
                    <div className="text-muted-foreground text-xs">Email:</div>
                    <div className="text-sm truncate">{selectedUser.email}</div>
                    <div className="text-muted-foreground text-xs">Signed Up:</div>
                    <div className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Department</p>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.department_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Role</p>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedDepartment('');
                  setSelectedRole('');
                  setShowApproveDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                className="w-full sm:w-auto" 
                onClick={handleApprove}
                disabled={actionLoading || !selectedDepartment || !selectedRole}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Approve User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Mobile-optimized dialog for rejection */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
            <DialogHeader className="mb-2">
              <DialogTitle>Reject User</DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Provide a reason for rejection
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">User Information</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="text-muted-foreground text-xs">Name:</div>
                    <div className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</div>
                    <div className="text-muted-foreground text-xs">Email:</div>
                    <div className="text-sm truncate">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reason for Rejection</p>
                  <Textarea
                    placeholder="Please provide a reason for rejecting this user's application"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setSelectedUser(null);
                  setRejectionReason('');
                  setShowRejectDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto" 
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RegistrationApproval;
