"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, Typography } from "antd";
import Link from "next/link";

const { Text } = Typography;

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const { set: setToken } = useLocalStorage<string>("token", "");

  const handleLogin = async (
    values: { username: string; password: string },
  ) => {
    try {
      const response = await apiService.post<User>("/login", values);
      console.log("Login Response:", response);

      if (response.token) {
        setToken(response.token);
        localStorage.setItem("token", response.token);
      } else alert("No token set in localStorage");

      if (response.id) {
        localStorage.setItem("userId", response.id);
      } else alert("No userId set in localStorage");

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
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
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
          name="password"
          label="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>

        <Form.Item style={{ width: "100%", textAlign: "center" }}>
          <Text>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "#1890ff" }}>
              Register here
            </Link>
          </Text>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
