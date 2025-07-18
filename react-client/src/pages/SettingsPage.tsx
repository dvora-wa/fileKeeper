"use client"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Alert, AlertDescription } from "../components/ui/alert"
import {
  Settings,
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  BarChart3,
  Check,
  Crown,
  Star,
  Zap
} from "lucide-react"

export default function SettingsPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate("/login")
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "plans", name: "Plans & Billing", icon: BarChart3 },

    // { id: "notifications", name: "Notifications", icon: Bell },
    // { id: "appearance", name: "Appearance", icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 ml-3 text-blue-600" />
              Account Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your settings and customize your experience
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:w-64">
              <Card>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        <tab.icon className="h-4 w-4 mr-3" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 ml-2 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 ml-2 text-blue-600" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Shield className="h-4 w-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications Tab */}

                </div >)}

              {activeTab === "plans" && (
                <div className="space-y-6">
                  {/* Current Plan */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <BarChart3 className="h-5 w-5 ml-2 text-blue-600" />
                          Current Plan
                        </span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                          Free Plan
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">10 GB</p>
                          <p className="text-sm text-gray-600">Storage Space</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">2.3 GB</p>
                          <p className="text-sm text-gray-600">Used</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">7.7 GB</p>
                          <p className="text-sm text-gray-600">Available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Plans */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Plans</CardTitle>
                      <p className="text-gray-600">Choose the plan that best fits your needs</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Free Plan */}
                        <div className="border rounded-lg p-6 relative">
                          <div className="text-center mb-4">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                            <h3 className="text-xl font-semibold">Free</h3>
                            <div className="mt-2">
                              <span className="text-3xl font-bold">$0</span>
                              <span className="text-gray-500">/month</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-6">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">10 GB Storage</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Basic File Management</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Web Access</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Basic Support</span>
                            </li>
                          </ul>

                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        </div>

                        {/* Pro Plan */}
                        <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-blue-50">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                              Most Popular
                            </span>
                          </div>

                          <div className="text-center mb-4">
                            <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <h3 className="text-xl font-semibold">Pro</h3>
                            <div className="mt-2">
                              <span className="text-3xl font-bold">$9.99</span>
                              <span className="text-gray-500">/month</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-6">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">100 GB Storage</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Advanced File Management</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Priority Support</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Advanced Search</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">File Versioning</span>
                            </li>
                          </ul>

                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Upgrade to Pro
                          </Button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="border rounded-lg p-6 relative">
                          <div className="text-center mb-4">
                            <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                            <h3 className="text-xl font-semibold">Enterprise</h3>
                            <div className="mt-2">
                              <span className="text-3xl font-bold">$29.99</span>
                              <span className="text-gray-500">/month</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-6">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">1 TB Storage</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">24/7 Premium Support</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Advanced Security</span>
                            </li>
                          </ul>

                          <Button variant="outline" className="w-full">
                            Contact Sales
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No billing history</p>
                        <p className="text-sm">You're currently on the free plan</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Storage Usage Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Storage Usage Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                            <span className="font-medium">Documents</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">1.2 GB</span>
                            <span className="text-sm text-gray-500 ml-2">(52%)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                            <span className="font-medium">Images</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">0.8 GB</span>
                            <span className="text-sm text-gray-500 ml-2">(35%)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                            <span className="font-medium">Videos & Other</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">0.3 GB</span>
                            <span className="text-sm text-gray-500 ml-2">(13%)</span>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-900">Need more storage?</span>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Upgrade Plan
                            </Button>
                          </div>
                          <p className="text-sm text-blue-700 mt-2">
                            Upgrade to Pro and get 10x more storage space plus advanced features.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* {
                activeTab === "notifications" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 ml-2 text-blue-600" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive updates about account activity</p>
                          </div>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Upload Notifications</p>
                            <p className="text-sm text-gray-600">Get notified when file uploads complete</p>
                          </div>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Security Notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts about suspicious activity</p>
                          </div>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              } */}

              {/* Appearance Tab */}
              {/* {
                activeTab === "appearance" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 ml-2 text-blue-600" />
                        Appearance and Display
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Theme</Label>
                          <div className="mt-2 grid grid-cols-3 gap-3">
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="w-4 h-4 bg-white border rounded-full"></div>
                              <span className="text-sm">Light</span>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                              <span className="text-sm">Dark</span>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-800 rounded-full"></div>
                              <span className="text-sm">Auto</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Language</Label>
                          <div className="mt-2">
                            <select className="w-full p-2 border rounded-md">
                              <option value="en">English</option>
                              <option value="he">עברית</option>
                              <option value="ar">العربية</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Font Size</Label>
                          <div className="mt-2">
                            <select className="w-full p-2 border rounded-md">
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              } */}

              {/* Danger Zone */}
              < Card className="mt-8 border-red-200" >
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      These actions are irreversible. Please be careful.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                      Delete All Files
                    </Button>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card >
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}