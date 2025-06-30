"use client";

import { useState } from "react";

import { auth, LoginRequest, userApi } from "@/lib/auth";
import { Alert, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginRequest>({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await userApi.login(formData);
            auth.setToken(response.token, response.username);
            window.location.href = "/dashboard";
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.errors?.[0]?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper sx={{ p: 4, width: "100%" }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        Đăng nhập
                    </Typography>

                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Nhập thông tin đăng nhập để truy cập hệ thống
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Tên đăng nhập"
                            value={formData.username}
                            onChange={handleInputChange("username")}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            margin="normal"
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}
