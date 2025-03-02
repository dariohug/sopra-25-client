// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Spin, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button } from "antd";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const router = useRouter();
    const { id } = useParams();
    const apiService = useApi();
    const [user, setUser] = useState<User | null>(null);        //state to save user info
    const [loading, setLoading] = useState(true);               //state to manage loadign indicator

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("token missing -> log in");
            router.push("/login");                              //redirect to login if user would not be loged in
            return;
        }

        if (!id) {
            console.error("No user ID found in params.");
            return;
        }

        const fetchUserProfile = async () => {
            try {

                const user: User = await apiService.get<User>(`/users/${id}`);
                setUser(user);
                console.log("Fetched user:", user);
                setLoading(false);

            } catch (error) {

                if (error instanceof Error) {
                    alert(`user could not be fetched:\n${error.message}`);
                } else { console.error("An unknown error occurred while fetching users."); }

            }
        };

        fetchUserProfile();
    }, [id, router]);

    if (loading) return <Spin size="small" />;                          // Loading Animation

    if (!user) return <p>User not found!</p>;

    // console.log("user.id (from API):", user?.id, typeof user?.id);
    // console.log("currentUserId (from localStorage):", localStorage.getItem("userId"), typeof localStorage.getItem("userId"));

    console.log("id:" , localStorage.getItem("userId"))

    return (
        <Card title={user?.username} className="profile-card">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Status:</strong> {user?.status}</p>
            {user?.creationDate && <p><strong>Creation Date:</strong> {new Date(user.creationDate).toLocaleDateString()}</p>}
            <p><strong>Birth Date:</strong> {user.birthday ? new Date(user.birthday).toLocaleDateString() : ""}</p>
            <p><strong>User-ID:</strong> {user?.id}</p>

            {user?.id === Number(localStorage.getItem("userId")) && (
                <Button type="primary" onClick={() => router.push(`/users/edit/${user.id}`)} style={{ marginTop: "10px" }}>
                    Edit Profile
                </Button>
            )}
        </Card>
    );
};

export default Profile;