import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Users,
  TrendingUp,
  BellRing,
  FileText,
  BarChart3,
  Activity,
  CheckCircle,
  Building2,
  Shield,
  Settings,
  UserCog,
  MessageSquare,
  AlertCircle,
  ClipboardList,
  DollarSign,
  Eye,
  Mail,
  PieChart,
  Lock,
  BookOpen,
  FileCheck
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CEODashboard = () => {
  // Enhanced data for the charts
  const revenueData = [
    { name: 'Jan', value: 400, secondValue: 380 },
    { name: 'Feb', value: 300, secondValue: 320 },
    { name: 'Mar', value: 600, secondValue: 550 },
    { name: 'Apr', value: 800, secondValue: 720 },
    { name: 'May', value: 500, secondValue: 480 },
    { name: 'Jun', value: 750, secondValue: 700 }
  ];

  const departmentPerformance = [
    { name: 'Finance', value: 85 },
    { name: 'Marketing', value: 78 },
    { name: 'Operations', value: 92 },
    { name: 'HR', value: 88 },
    { name: 'IT', value: 76 }
  ];

  const pendingApprovals = [
    { id: 'REQ-124', type: 'Financial Transaction', department: 'Finance', amount: '$5,200', submitted: '1 day ago' },
    { id: 'REQ-123', type: 'Budget Request', department: 'Marketing', amount: '$3,500', submitted: '2 days ago' },
    { id: 'REQ-122', type: 'Monthly Report', department: 'HR', amount: 'N/A', submitted: '3 days ago' },
  ];

  const notifications = [
    { id: 1, title: 'New User Registration', description: '3 new employees awaiting approval', time: '1 hour ago', priority: 'medium' },
    { id: 2, title: 'Financial Alert', description: 'Unusual spending detected in IT department', time: '3 hours ago', priority: 'high' },
    { id: 3, title: 'Department Update', description: 'Marketing submitted quarterly report', time: '5 hours ago', priority: 'low' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Administrator Dashboard</h1>
            <p className="text-gray-500 mt-1">Complete system overview and management</p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
            <BellRing className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">{notifications.length} Notifications</span>
          </div>
        </div>

        {/* SECTION 1: Overview Panel */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Company Overview
          </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <OverviewCard
              title="Total Revenue"
              value="$1.24M"
              change="+8.2%"
              isPositive={true}
              icon={<DollarSign className="h-5 w-5" />}
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            />
            <OverviewCard
              title="Pending Approvals"
              value="7"
              change="+2"
              isPositive={false}
              icon={<CheckCircle className="h-5 w-5" />}
              className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
            />
          <OverviewCard
            title="Departments"
            value="7"
              change="Active"
            isPositive={true}
            icon={<Building2 className="h-5 w-5" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <OverviewCard
            title="Total Employees"
            value="248"
            change="+12"
            isPositive={true}
            icon={<Users className="h-5 w-5" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard
              title="Financial Performance"
              subtitle="Revenue vs Expenses (Current Year)"
            type="area"
            data={revenueData}
          />
          <ChartCard
            title="Department Performance"
              subtitle="Productivity rate by department (%)"
            type="bar"
            data={departmentPerformance}
          />
        </div>
        </section>

        {/* SECTION 2: User & Department Management */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            User & Department Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Management
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">New Registration Requests</p>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">3 Pending</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Active Users</p>
                  <span className="font-medium text-green-600">234</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Inactive Users</p>
                  <span className="font-medium text-gray-600">14</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                    Manage Users
                  </button>
                  <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-sm">
                    Role Permissions
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                Department Control
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Total Departments</p>
                  <span className="font-medium text-blue-600">7</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Department Heads</p>
                  <span className="font-medium text-blue-600">7 Assigned</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Structure Changes</p>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">None Pending</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                    Manage Departments
                  </button>
                  <button className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm">
                    Create Department
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 3: Approvals & Decision-Making */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Approvals & Decision-Making
          </h2>
          <Card className="p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ClipboardList className="h-5 w-5 text-blue-600 mr-2" />
                Pending Approvals
              </h3>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                {pendingApprovals.length} Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{approval.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{approval.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{approval.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{approval.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{approval.submitted}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">Approve</button>
                          <button className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Requests
              </button>
            </div>
          </Card>
        </section>

        {/* SECTION 4: Audit Logs & Security */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Audit Logs & Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="h-5 w-5 text-blue-600 mr-2" />
                System Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">Financial Record Modified</p>
                    <p className="text-xs text-gray-500">By Finance Dept. (John D.)</p>
                  </div>
                  <span className="text-xs text-gray-500">10 mins ago</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">New User Created</p>
                    <p className="text-xs text-gray-500">By HR Dept. (Sarah M.)</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">Permission Changed</p>
                    <p className="text-xs text-gray-500">By Admin (You)</p>
                  </div>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
                <button className="mt-2 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  View Full Audit Log
                </button>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                Security Alerts
            </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Unusual Login Activity</p>
                    <p className="text-xs text-gray-500">Marketing dept. account accessed from new location</p>
                    <p className="text-xs text-amber-600 mt-1">Medium Risk • 3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Multiple Failed Login Attempts</p>
                    <p className="text-xs text-gray-500">Finance department user account</p>
                    <p className="text-xs text-red-600 mt-1">High Risk • 1 day ago</p>
                  </div>
              </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                    Security Report
                  </button>
                  <button className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm">
                    Lock Account
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 5: Communications & Notifications */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Communications & Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BellRing className="h-5 w-5 text-blue-600 mr-2" />
                Recent Notifications
              </h3>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className={`p-2 rounded-full ${
                      notification.priority === 'high' 
                        ? 'bg-red-100' 
                        : notification.priority === 'medium'
                          ? 'bg-amber-100'
                          : 'bg-blue-100'
                    }`}>
                      <BellRing className={`h-4 w-4 ${
                        notification.priority === 'high' 
                          ? 'text-red-600' 
                          : notification.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between mt-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                    View All
                  </button>
                  <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm">
                    Mark All Read
                  </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                Communication Center
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Unread Messages</p>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">5 New</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Department Requests</p>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">3 Pending</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Recent Announcements</p>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                    Inbox
                  </button>
                  <button className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm">
                    New Announcement
                  </button>
                </div>
                <Link to="/dashboard/forum" className="block w-full px-4 py-2 mt-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-sm text-center">
                  Go to Forum
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 6: Financial & Performance Reports */}
        <section className="mt-10 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            Financial & Performance Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChart className="h-5 w-5 text-blue-600 mr-2" />
                Financial Reports
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Income Statement</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Balance Sheet</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Cash Flow</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <button className="mt-2 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  All Financial Reports
                </button>
              </div>
            </Card>

            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                Department Reports
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Quarterly Performance</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Budget vs. Actual</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <p className="font-medium">Resource Allocation</p>
                  <button className="text-blue-600 text-sm">View</button>
                </div>
                <button className="mt-2 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  All Department Reports
                </button>
              </div>
            </Card>

            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Quick Links
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Company Policies
                </button>
                <Link to="/dashboard/profile" className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-sm flex items-center">
                  <UserCog className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
                <button className="w-full px-4 py-2 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors text-sm flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </button>
                <button className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Settings
                </button>
            </div>
          </Card>
        </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default CEODashboard;
