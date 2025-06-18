"use client";

import { useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User, CreditCard, Shield, Palette, Bot, Mail, LogOut } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useSecureLogout } from "@/hooks/useSecureLogout";

export default function SettingsPage() {
  const { openUserProfile } = useClerk();
  const { secureSignOut } = useSecureLogout();

  const handleManageAccount = () => {
    openUserProfile();
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        <div className="flex items-center gap-3 p-6 pb-4">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="account" className="w-full flex flex-col flex-1 overflow-hidden px-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleManageAccount} className="w-full">
                    Manage Account
                  </Button>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>
                    Sign out of your account or manage sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={secureSignOut} 
                    variant="destructive" 
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription
                  </CardTitle>
                  <CardDescription>
                    Upgrade to unlock more features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    You&apos;re currently on the Free plan
                  </div>
                  <Button className="w-full">
                    Upgrade to Pro
                  </Button>
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
            </div>
          </TabsContent>


          <TabsContent value="themes" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Presets
                </CardTitle>
                <CardDescription>
                  Choose from beautiful pre-designed themes to customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
            </div>
          </TabsContent>
          <TabsContent value="contact" className="flex-1 overflow-auto">
            <div className="space-y-6 pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get help or provide feedback about T3 Chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Need help? We&apos;re here to assist you.
                </div>
                <Button className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 