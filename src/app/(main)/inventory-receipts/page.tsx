"use client";

import { useEffect, useState } from "react";

import SkeletonLoader from "@/components/SkeletonLoader";
import { extractErrorMessage } from "@/lib/error-utils";
import { inventoryReceiptApi } from "@/lib/inventory-receipts";
import { InventoryReceiptResponse } from "@/types";
import { Add as AddIcon, Visibility as ViewIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import Link from "next/link";

export default function InventoryReceiptsPage() {
    const [receipts, setReceipts] = useState<InventoryReceiptResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load inventory receipts
    const loadReceipts = async () => {
        try {
            setLoading(true);
            setError(null);

            const receiptsData = await inventoryReceiptApi.getAll();
            setReceipts(receiptsData);
        } catch (err: any) {
            console.error("Error loading inventory receipts:", err);
            setError(extractErrorMessage(err, "Không thể tải danh sách phiếu nhập kho. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReceipts();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <SkeletonLoader type="table" rows={5} columns={6} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Phiếu Nhập Kho
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    href="/inventory-receipts/create"
                    sx={{ bgcolor: "primary.main" }}
                >
                    Tạo Phiếu Nhập
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Mã Phiếu</strong></TableCell>
                                    <TableCell><strong>Ngày Nhập</strong></TableCell>
                                    <TableCell><strong>Tổng Số Mặt Hàng</strong></TableCell>
                                    <TableCell><strong>Ghi Chú</strong></TableCell>
                                    <TableCell><strong>Ngày Tạo</strong></TableCell>
                                    <TableCell align="center"><strong>Thao Tác</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                Chưa có phiếu nhập kho nào
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    receipts.map((receipt) => (
                                        <TableRow key={receipt.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {receipt.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(receipt.receipt_date)}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {receipt.total_items} mặt hàng
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        maxWidth: 200, 
                                                        overflow: "hidden", 
                                                        textOverflow: "ellipsis" 
                                                    }}
                                                >
                                                    {receipt.notes || "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(receipt.created_at)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton 
                                                        component={Link}
                                                        href={`/inventory-receipts/${receipt.code}`}
                                                        size="small"
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
} 