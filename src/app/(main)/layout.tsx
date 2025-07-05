"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoadingOverlay from "@/components/LoadingOverlay";
import { auth } from "@/lib/auth";
import { statisticsApi } from "@/lib/statistics";
import { AppBar, Badge, Button, Toolbar, Typography } from "@mui/material";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const authenticated = auth.isAuthenticated();
        const currentUsername = auth.getUsername();
        setIsAuthenticated(authenticated);
        setUsername(currentUsername);

        if (authenticated) {
            // Load pending orders count
            loadPendingOrdersCount();
        } else {
            window.location.href = "/login";
        }
    }, []);

    const loadPendingOrdersCount = async () => {
        try {
            setLoading(true);
            const stats = await statisticsApi.getDashboardStats();
            setPendingOrdersCount(stats.pending_orders);
        } catch (err) {
            console.error("Error loading pending orders count:", err);
        } finally {
            setLoading(false);
        }
    };

    // Expose refresh function globally for other components
    useEffect(() => {
        (window as any).refreshPendingOrdersCount = loadPendingOrdersCount;
        return () => {
            delete (window as any).refreshPendingOrdersCount;
        };
    }, []);

    const handleLogout = () => {
        auth.logout();
    };

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ mr: 3 }}>
                        Ứng dụng Đặt hàng
                    </Typography>
                    
                    {/* Navigation Buttons */}
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/dashboard"
                        sx={{ mr: 1 }}
                    >
                        Bảng điều khiển
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/products"
                        sx={{ mr: 1 }}
                    >
                        Sản phẩm
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/boms"
                        sx={{ mr: 1 }}
                    >
                        BOM
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/customers"
                        sx={{ mr: 1 }}
                    >
                        Khách hàng
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/inventory-history"
                        sx={{ mr: 1 }}
                    >
                        Lịch sử Kho
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        href="/inventory-receipts"
                        sx={{ mr: 1 }}
                    >
                        Phiếu Nhập Kho
                    </Button>
                    <Badge badgeContent={pendingOrdersCount} color="warning" max={99}>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            href="/orders/create"
                            sx={{ mr: 1 }}
                        >
                            Tạo Đơn hàng
                        </Button>
                    </Badge>
                    
                    <Typography variant="body1" sx={{ ml: "auto", mr: 2 }}>
                        Chào mừng, {username || "Người dùng"}!
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Toolbar>
            </AppBar>

            {children}
            
            <LoadingOverlay 
                open={loading} 
                message="Đang tải dữ liệu..." 
            />
        </>
    );
} 