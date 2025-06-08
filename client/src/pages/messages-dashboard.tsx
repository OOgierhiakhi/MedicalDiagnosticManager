import { useState } from "react";
import { Link } from "wouter";
import { 
  MessageSquare, 
  Bell, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Send,
  Plus,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export default function MessagesDashboard() {
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState("announcement");
  const [filterType, setFilterType] = useState("all");

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: messageMetrics } = useQuery({
    queryKey: ["/api/messages/metrics"],
  });

  const filteredMessages = messages.filter((message: any) => 
    filterType === "all" || message.messageType === filterType
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/main-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages & Communications</h1>
              <p className="text-gray-600 dark:text-gray-400">Internal messaging and department communications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="notification">Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Messages
              </CardTitle>
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageMetrics?.[0]?.totalMessages || 7}</div>
              <p className="text-xs text-blue-600">Active communications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread Messages
              </CardTitle>
              <Bell className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageMetrics?.[0]?.unreadMessages || 3}</div>
              <p className="text-xs text-orange-600">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Critical Alerts
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageMetrics?.[0]?.criticalAlerts || 1}</div>
              <p className="text-xs text-red-600">Urgent attention needed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Departments
              </CardTitle>
              <Users className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-green-600">Active communication channels</p>
            </CardContent>
          </Card>
        </div>

        {/* Message Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <span>System Announcements</span>
              </CardTitle>
              <CardDescription>Important system-wide communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">CT Scanner Maintenance Complete</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Equipment back online - all services restored</p>
                  <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-300">New Test Parameters Updated</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reference ranges updated for liver function tests</p>
                  <p className="text-xs text-gray-500 mt-2">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Critical Alerts</span>
              </CardTitle>
              <CardDescription>Urgent notifications requiring immediate action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Quality Control Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Chemistry analyzer - requires immediate attention</p>
                  <Badge variant="destructive" className="text-xs mt-2">URGENT</Badge>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Inventory Alert Resolved</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reagent stock replenished successfully</p>
                  <p className="text-xs text-gray-500 mt-2">3 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Department Updates</span>
              </CardTitle>
              <CardDescription>Regular operational communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Daily Revenue Target Met</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">₦235,500 achieved - 115% of target</p>
                  <p className="text-xs text-gray-500 mt-2">Today</p>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Staff Training Completed</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">New equipment training for ultrasound team</p>
                  <p className="text-xs text-gray-500 mt-2">Yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest communications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredMessages.map((message: any, index: number) => (
                  <div key={message.id || index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      {message.messageType === 'alert' && (
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      {message.messageType === 'announcement' && (
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      {message.messageType === 'notification' && (
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {message.title || message.messageType.charAt(0).toUpperCase() + message.messageType.slice(1)}
                        </h4>
                        <Badge variant={
                          message.messageType === 'alert' ? 'destructive' : 
                          message.messageType === 'announcement' ? 'default' : 
                          'secondary'
                        }>
                          {message.messageType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {message.content || message.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {message.department} • {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send New Message</CardTitle>
              <CardDescription>Broadcast message to departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message Type</label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message Content</label>
                  <Textarea
                    placeholder="Enter your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Communication Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Communication Tools</CardTitle>
            <CardDescription>Access messaging and notification functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Bell className="w-6 h-6" />
                <span className="text-xs">Department Alerts</span>
              </Button>
              
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span className="text-xs">Staff Notifications</span>
              </Button>
              
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">System Messages</span>
              </Button>
              
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-xs">Emergency Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}