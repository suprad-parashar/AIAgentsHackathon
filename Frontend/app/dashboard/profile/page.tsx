"use client"

import type React from "react"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {useAuth} from "@/context/auth-context"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import DashboardLayout from "@/components/dashboard-layout"
import LoadingSpinner from "@/components/loading-spinner"

export default function ProfilePage() {
  const {user, loading} = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    department: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user?.email) {
      fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/users/details?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setProfileData({
            name: data.name,
            email: data.email,
            bio: data.bio || "",
            department: data.department_or_major || "",
          });
        })
        .catch((error) => console.error("Error fetching user details:", error));
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner/>
  }

  if (!user) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          department_or_major: profileData.department,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout user={user} onLogout={() => router.push("/login")}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={profileData.email} disabled/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <Separator/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department/Major</Label>
                <Input
                  id="department"
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

