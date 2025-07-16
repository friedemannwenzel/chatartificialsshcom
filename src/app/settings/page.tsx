"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Shield, LogOut, User, MessageSquare } from "lucide-react";
import { MessageUsageBar } from "@/components/MessageUsageBar";
import { useSecureLogout } from "@/hooks/useSecureLogout";
import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const { secureSignOut } = useSecureLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await secureSignOut();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="general" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      placeholder="Enter your display name"
                      defaultValue={user?.fullName || ""}
                      className="max-w-sm"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Display name is managed through your account settings
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="Enter your email"
                      defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
                      className="max-w-sm"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address is managed through your account settings
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Manage your privacy and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Privacy settings coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
              <MessageUsageBar />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Usage Information
                  </CardTitle>
                  <CardDescription>
                    Learn about your message usage and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Weekly Message Limit</h4>
                    <p className="text-sm text-muted-foreground">
                      You can send up to 15 messages per week. This limit resets every Monday at midnight UTC.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Models</h4>
                    <p className="text-sm text-muted-foreground">
                      All AI models (OpenAI GPT, Google Gemini, etc.) count toward your weekly limit equally.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">File Attachments</h4>
                    <p className="text-sm text-muted-foreground">
                      Messages with file attachments count as one message toward your limit.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Account Settings</p>
                          <p className="text-sm text-muted-foreground">
                            Manage your profile, email, and security settings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <UserButton 
                          appearance={{
                            elements: {
                              avatarBox: "h-8 w-8",
                              userButtonPopoverCard: "bg-card border-border",
                              userButtonPopoverActionButton: "hover:bg-muted",
                            }
                          }}
                          afterSignOutUrl="/"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sign out of your account. This will clear all local data and redirect you to the home page.
                        </p>
                      </div>
                      
                      <Button 
                        variant="destructive" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full sm:w-auto"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Signing out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 