"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { handleWebpackExternalForEdgeRuntime } from "next/dist/build/webpack/plugins/middleware-plugin";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
    username: string;
    name: string;
    password: string;
}

const Register: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();
    // useLocalStorage hook example use
    // The hook returns an object with the value and two functions
    // Simply choose what you need from the hook:
    const {
        // value: token, // is commented out because we do not need the token value
        set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
        // clear: clearToken, // is commented out because we do not need to clear the token when logging in
    } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
    // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

    const handleRegister = async (values: FormFieldProps) => {
        try {
            // Call the API service and let it handle JSON serialization and error handling
            const response = await apiService.post<User>("/users", values);

            // log values
            console.log(values)

            // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
            if (response.token) {
                setToken(response.token);
            }

            // Navigate to the user overview
            handleLogin(values)
        } catch (error) {
            if (error instanceof Error) {
                alert(`Something went wrong during the login:\n${error.message}`);
            } else {
                console.error("An unknown error occurred during login.");
            }
        }
    };

    const handleLogin = async (values: { username: string; password: string }) => {
        try {
            // Call the API service and let it handle JSON serialization and error handling
            // const response = await apiService.post<User>("/users", values);
            const response = await apiService.post<User>("/login", values);
            console.log("Login Response:", response);

            // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
            if (response.token) {
                setToken(response.token);
                localStorage.setItem("token", response.token)
            } else { alert("No token set in localStorage"); }

            if (response.id) {
                localStorage.setItem("userId", response.id);
            } else { alert("No userId set in localStorage"); }

            // Navigate to the user overview
            router.push("/users");
        } catch (error) {
            if (error instanceof Error) {
                alert(`Something went wrong during the login:\n${error.message}`);
            } else {
                console.error("An unknown error occurred during login.");
            }
        }
    };

    return (
        <div className="login-container">
            <Form
                form={form}
                name="Register"
                size="large"
                variant="outlined"
                onFinish={handleRegister}
                layout="vertical"
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please input your username!" }]}
                >
                    <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please input your name!" }]}
                >
                    <Input placeholder="Enter name" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="password"
                    rules={[{ required: true, message: "Please input a Password!" }]}
                >
                    <Input placeholder="Enter name" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-button">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
