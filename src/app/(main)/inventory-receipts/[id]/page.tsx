"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SkeletonLoader from "@/components/SkeletonLoader";
import { extractErrorMessage } from "@/lib/error-utils";
import { inventoryReceiptApi } from "@/lib/inventory-receipts";
import { productApi } from "@/lib/products";
import { InventoryReceiptResponse, ProductResponse } from "@/types";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

interface ReceiptItemWithProduct {
    id: number;
    inventory_receipt_id: number;
    product_id: number;
    quantity: number;
    unit_cost?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    product?: ProductResponse;
}

export default function InventoryReceiptDetailPage() {
    const params = useParams();
    const router = useRouter();
    const receiptCode = params.id as string; // Now expecting code instead of ID

    const [receipt, setReceipt] = useState<InventoryReceiptResponse | null>(null);
    const [itemsWithProducts, setItemsWithProducts] = useState<ReceiptItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReceiptDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load receipt data
                const receiptData = await inventoryReceiptApi.getOne(receiptCode);
                setReceipt(receiptData);

                // Load product details for each item
                if (receiptData.items && receiptData.items.length > 0) {
                    const itemsWithProductData = await Promise.all(
                        receiptData.items.map(async (item) => {
                            try {
                                const product = await productApi.getOne(item.product_id);
                                return { ...item, product };
                            } catch (productErr) {
                                console.error(`Error loading product ${item.product_id}:`, productErr);
                                return { ...item, product: undefined };
                            }
                        })
                    );
                    setItemsWithProducts(itemsWithProductData);
                }
            } catch (err: any) {
                console.error("Error loading receipt detail:", err);
                setError(extractErrorMessage(err, "Không thể tải chi tiết phiếu nhập kho."));
            } finally {
                setLoading(false);
            }
        };

        if (receiptCode) {
            loadReceiptDetail();
        }
    }, [receiptCode]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const calculateTotalValue = () => {
        return itemsWithProducts.reduce((total, item) => {
            if (item.unit_cost) {
                return total + (item.quantity * item.unit_cost);
            }
            return total;
        }, 0);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <SkeletonLoader type="card" rows={3} />
            </Box>
        );
    }

    if (error || !receipt) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {error || "Không tìm thấy phiếu nhập kho."}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ mr: 2 }}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" component="h1">
                    Chi tiết Phiếu Nhập Kho
                </Typography>
            </Box>

            {/* Receipt Information */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Thông Tin Phiếu Nhập
                    </Typography>
                    
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Mã Phiếu
                            </Typography>
                            <Chip 
                                label={receipt.code} 
                                color="primary" 
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ngày Nhập
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(receipt.receipt_date)}
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Tổng Số Mặt Hàng
                            </Typography>
                            <Typography variant="body1">
                                {receipt.total_items} mặt hàng
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Tổng Giá Trị
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {formatPrice(calculateTotalValue())}
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ngày Tạo
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(receipt.created_at)}
                            </Typography>
                        </Box>
                    </Box>

                    {receipt.notes && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ghi Chú
                            </Typography>
                            <Typography variant="body1">
                                {receipt.notes}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Items List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Danh Sách Sản Phẩm
                    </Typography>
                    
                    {itemsWithProducts.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                            Không có sản phẩm nào trong phiếu nhập này.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Sản Phẩm</strong></TableCell>
                                        <TableCell align="center"><strong>Số Lượng</strong></TableCell>
                                        <TableCell align="right"><strong>Đơn Giá (VND/đơn vị)</strong></TableCell>
                                        <TableCell align="right"><strong>Thành Tiền</strong></TableCell>
                                        <TableCell><strong>Ghi Chú</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {itemsWithProducts.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {item.product?.name || `Sản phẩm #${item.product_id}`}
                                                </Typography>
                                                {item.product?.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.product.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2">
                                                    {formatNumber(item.quantity)} {item.product?.unit?.name || ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {item.unit_cost ? formatPrice(item.unit_cost) : "—"}
                                                </Typography>
                                                {item.product?.unit?.code && item.unit_cost && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        (VND/{item.product.unit.code})
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {item.unit_cost ? formatPrice(item.quantity * item.unit_cost) : "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {item.notes || "—"}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
} 