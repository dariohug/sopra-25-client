// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, DatePicker, Input, message, Spin } from "antd";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
// import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

// const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null); //state to save user info
  const [loading, setLoading] = useState(true); //state to manage loadign indicator
  const [isEditing, setIsEditing] = useState(false); //toggle if a user is editing
  const [username, setUsername] = useState(""); //Edit username

  const formattedBirthday = user?.birthday
    ? new Date(user.birthday).toISOString()
    : null;
  const [birthday, setBirthday] = useState<string | null>(formattedBirthday);

  const currentuserId = Number(localStorage.getItem("userId")); //Define current ID as Number

  useEffect(() => {
    // const token = localStorage.getItem("token");

    const fetchUserProfile = async () => {
      try {
        const user: User = await apiService.get<User>(`/users/${id}`);
        setUser(user);
        if (user.username != null) setUsername(user.username);
        if (user.birthday != null) setBirthday(user.birthday.toISOString);
        console.log("Fetched user:", user);
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          alert(`user could not be fetched:\n${error.message}`);
        } else console.error("An unknown error occurred while fetching users.");
      }
    };
    fetchUserProfile();
  }, [id, router]);

  const handleEdit = async () => {
    if (!user) return;

    try {
      const requestBody = {
        username,
        birthday: birthday ? new Date(birthday).toISOString() : null,
      };
      await apiService.put(`/users/${user.id}`, requestBody);

      message.success("Profile has been updated!");
      console.log("given to backend: ", requestBody);

      setUser({
        ...user,
        username,
        birthday: birthday ? new Date(birthday) : null,
      });

      setIsEditing(false);
      router.push(`/users/${user.id}`);
    } catch (error) {
      message.error("Failed!");
      console.error("update Error:", error);
    }
  };

  if (loading) return <Spin size="small" />; // Loading Animation

  // console.log("user.id (from API):", user?.id, typeof user?.id);
  // console.log("currentUserId (from localStorage):", localStorage.getItem("userId"), typeof localStorage.getItem("userId"));

  console.log("id:", localStorage.getItem("userId"));

  return (
    <Card title={user?.username} className="profile-card">
      <p>
        <strong>Name:</strong> {user?.name}
      </p>
      <p>
        <strong>User-ID:</strong> {user?.id}
      </p>

      {/* Editable Username */}
      <p>
        <strong>Username:</strong>
        {isEditing
          ? (
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )
          : (
            user?.username
          )}
      </p>

      {/* Editable Birthday */}
      <p>
        <strong>Birth Date:</strong>
        {isEditing
          ? (
            <DatePicker
              value={birthday ? dayjs(birthday) : null}
              onChange={(date) =>
                setBirthday(date ? date.format("YYYY-MM-DD") : null)}
              popupClassName="custom-date-picker"
            />
          )
          : (
            user?.birthday
              ? new Date(user.birthday).toLocaleDateString()
              : "Not set"
          )}
      </p>

      <p>
        <strong>Status:</strong> {user?.status}
      </p>
      {user?.creationDate && (
        <p>
          <strong>Creation Date:</strong>{" "}
          {new Date(user.creationDate).toLocaleDateString()}
        </p>
      )}

      {/* Show edit/save buttons if the user is viewing their own profile */}
      {Number(user?.id) === Number(currentuserId) && (
        isEditing
          ? (
            <>
              <Button
                type="primary"
                onClick={handleEdit}
                style={{ marginTop: "10px", marginRight: "10px" }}
              >
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                style={{ marginTop: "10px" }}
              >
                Cancel
              </Button>
            </>
          )
          : (
            <Button
              type="primary"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: "10px" }}
            >
              Edit Profile
            </Button>
          )
      )}
    </Card>
  );
};

export default Profile;
