
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  FileText,
  Mail,
  CalendarClock,
  CheckCircle,
  Clock,
  Inbox,
  ListTodo,
  CalendarDays,
  MessageSquare,
  PhoneCall
} from 'lucide-react';

const SecretaryDashboard = () => {
  const weeklyTaskData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 18 }
  ];

  const communicationData = [
    { name: 'Emails', value: 45 },
    { name: 'Calls', value: 22 },
    { name: 'Meetings', value: 18 },
    { name: 'Messages', value: 35 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Secretary Dashboard</h1>
          <p className="text-gray-500 mt-1">Administrative overview and task management</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Pending Tasks"
          value="8"
          change="-2"
          isPositive={true}
          icon={<Clock className="h-5 w-5" />}
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        />
        <OverviewCard
          title="Unread Messages"
          value="15"
          change="+5"
          isPositive={false}
          icon={<Mail className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Completed Tasks"
          value="42"
          change="+12"
          isPositive={true}
          icon={<CheckCircle className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Upcoming Meetings"
          value="7"
          change="+2"
          isPositive={false}
          icon={<CalendarDays className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Task Completion"
          subtitle="Weekly task management metrics"
          type="line"
          data={weeklyTaskData}
        />

        <ChartCard
          title="Communication Channels"
          subtitle="Volume by channel type"
          type="bar"
          data={communicationData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarDays className="h-5 w-5 text-blue-600 mr-2" />
            Today's Schedule
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">9:00</p>
                <p className="text-xs text-gray-500">AM</p>
              </div>
              <div>
                <p className="font-medium">Executive Meeting</p>
                <p className="text-sm text-gray-500">Conference Room A - 1 hour</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">11:30</p>
                <p className="text-xs text-gray-500">AM</p>
              </div>
              <div>
                <p className="font-medium">Client Call</p>
                <p className="text-sm text-gray-500">Zoom Meeting - 45 mins</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">2:00</p>
                <p className="text-xs text-gray-500">PM</p>
              </div>
              <div>
                <p className="font-medium">Document Review</p>
                <p className="text-sm text-gray-500">Office - 1.5 hours</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ListTodo className="h-5 w-5 text-blue-600 mr-2" />
            Priority Tasks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-medium">1</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">Prepare Board Meeting Notes</p>
                <p className="text-xs text-gray-500">Due in 2 hours</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium">2</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">Schedule Q3 Planning Session</p>
                <p className="text-xs text-gray-500">Due tomorrow</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">3</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">Review Travel Itinerary</p>
                <p className="text-xs text-gray-500">Due in 2 days</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all tasks
          </button>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
            Recent Communications
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
                JD
              </div>
              <div>
                <p className="font-medium">John Davidson</p>
                <p className="text-sm text-gray-500 truncate">Re: Marketing proposal review</p>
                <p className="text-xs text-gray-400">35 mins ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                LS
              </div>
              <div>
                <p className="font-medium">Laura Smith</p>
                <p className="text-sm text-gray-500 truncate">Updated meeting agenda</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-medium text-xs">
                MJ
              </div>
              <div>
                <p className="font-medium">Mark Johnson</p>
                <p className="text-sm text-gray-500 truncate">Please call when available</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
