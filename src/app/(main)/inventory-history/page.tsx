"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback,useEffect, useState } from "react";

import SkeletonLoader from "@/components/SkeletonLoader";
import { productApi } from "@/lib/products";
import { InventoryHistoryResponse, ProductResponse } from "@/types";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

export default function InventoryHistoryPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | "">("");
    const [history, setHistory] = useState<InventoryHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

    // Load products
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productApi.getAll(undefined, "PURCHASE");
            setProducts(data);
            
            // Check if there's a product parameter in the URL
            const productParam = searchParams.get("product");
            if (productParam) {
                const productId = parseInt(productParam, 10);
                if (!isNaN(productId) && data.some(p => p.id === productId)) {
                    setSelectedProductId(productId);
                } else {
                    setSelectedProductId(data.length > 0 ? data[0].id : "");
                }
            } else {
                setSelectedProductId(data.length > 0 ? data[0].id : "");
            }
        } catch (err: any) {
            console.error("Error loading products:", err);
            
            // Extract error message from backend response
            let errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại.";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    // Load inventory history for selected product
    const loadHistory = async (productId: number) => {
        try {
            setError(null);
            const data = await productApi.getInventoryHistory(productId);
            setHistory(data);
            
            // Load product details to get unit information
            const product = products.find(p => p.id === productId);
            setSelectedProduct(product || null);
        } catch (err: any) {
            console.error("Error loading history:", err);
            
            // Extract error message from backend response
            let errorMessage = "Không thể tải lịch sử kho. Vui lòng thử lại.";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        if (selectedProductId && typeof selectedProductId === "number") {
            loadHistory(selectedProductId);
        }
    }, [selectedProductId]);

    // Format date to Vietnamese locale
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateString));
    };

    // Format number with thousand separators
    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(number);
    };

    // Extract NK code from note and create link if found
    const renderNoteWithLink = (note: string | null | undefined) => {
        if (!note) return "-";
        
        // Check if note contains NK code pattern
        const nkMatch = note.match(/NK\d{5}/);
        if (nkMatch) {
            const nkCode = nkMatch[0];
            const beforeNK = note.substring(0, note.indexOf(nkCode));
            const afterNK = note.substring(note.indexOf(nkCode) + nkCode.length);
            
            return (
                <>
                    {beforeNK}
                    <Link 
                        href={`/inventory-receipts/${nkCode}`}
                        style={{ 
                            color: '#1976d2', 
                            textDecoration: 'underline',
                            fontWeight: 'bold'
                        }}
                    >
                        {nkCode}
                    </Link>
                    {afterNK}
                </>
            );
        }
        
        return note;
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Lịch sử Kho
                    </Typography>
                    <Button
                        component={Link}
                        href="/products"
                        variant="outlined"
                        size="small"
                        disabled
                    >
                        Quay lại Sản phẩm
                    </Button>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth disabled>
                        <InputLabel>Sản phẩm</InputLabel>
                        <Select value="" label="Sản phẩm">
                            <MenuItem>Đang tải...</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Card>
                    <CardContent>
                        <SkeletonLoader type="table" rows={8} columns={6} />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Lịch sử Kho
                </Typography>
                <Button
                    component={Link}
                    href="/products"
                    variant="outlined"
                    size="small"
                >
                    Quay lại Sản phẩm
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>Sản phẩm</InputLabel>
                    <Select
                        value={selectedProductId}
                        label="Sản phẩm"
                        onChange={(e) => setSelectedProductId(e.target.value as number)}
                    >
                        {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                                {product.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Số lượng thay đổi</TableCell>
                                    <TableCell>Số lượng sau cập nhật</TableCell>
                                    <TableCell>Người nhập</TableCell>
                                    <TableCell>Ngày nhập</TableCell>
                                    <TableCell>Ghi chú</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Không có lịch sử kho cho sản phẩm này
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: item.quantity >= 0 ? 'success.main' : 'error.main',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {item.quantity >= 0 ? '+' : ''}{formatNumber(item.quantity)} {selectedProduct?.unit?.name || ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {formatNumber(item.final_quantity)} {selectedProduct?.unit?.name || ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{item.importer_name}</TableCell>
                                            <TableCell>{formatDate(item.imported_at)}</TableCell>
                                            <TableCell>
                                                {renderNoteWithLink(item.note)}
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