"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import { extractErrorMessage } from "@/lib/error-utils";
import { inventoryReceiptApi } from "@/lib/inventory-receipts";
import { productApi } from "@/lib/products";
import { CreateInventoryReceiptRequest, ProductResponse } from "@/types";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import {
    Alert,
    Autocomplete,
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
    TextField,
    Typography,
} from "@mui/material";

interface ItemFormData {
    tempId: string;
    product_id: number;
    product?: ProductResponse;
    quantity: string;
    unit_cost: string;
    notes: string;
}

export default function CreateInventoryReceiptPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Form data
    const [receiptDate, setReceiptDate] = useState<string>(() => {
        const today = new Date();
        today.setHours(today.getHours() + 7); // Vietnam timezone
        return today.toISOString().slice(0, 16);
    });
    const [notes, setNotes] = useState<string>("");
    const [items, setItems] = useState<ItemFormData[]>([]);

    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoadingProducts(true);
                const productsData = await productApi.getAll(undefined, "PURCHASE");
                setProducts(productsData);
            } catch (err: any) {
                console.error("Error loading products:", err);
                setError(extractErrorMessage(err, "Không thể tải danh sách sản phẩm."));
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, []);

    // Add new item
    const addItem = () => {
        const newItem: ItemFormData = {
            tempId: `temp-${Date.now()}`,
            product_id: 0,
            quantity: "",
            unit_cost: "",
            notes: "",
        };
        setItems([...items, newItem]);
    };

    // Remove item
    const removeItem = (tempId: string) => {
        setItems(items.filter(item => item.tempId !== tempId));
    };

    // Update item
    const updateItem = (tempId: string, field: keyof ItemFormData, value: any) => {
        setItems(items.map(item => 
            item.tempId === tempId 
                ? { ...item, [field]: value }
                : item
        ));
    };

    // Handle product selection
    const handleProductChange = (tempId: string, product: ProductResponse | null) => {
        setItems(items.map(item => 
            item.tempId === tempId 
                ? { 
                    ...item, 
                    product: product || undefined,
                    product_id: product?.id || 0,
                    quantity: "",
                    unit_cost: "",
                    notes: ""
                }
                : item
        ));
    };

    // Format number with thousand separators (for display)
    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(number);
    };

    // Format price with currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    // Parse formatted number back to number
    const parseFormattedNumber = (value: string): number => {
        // Remove all non-digit characters except dots and commas
        const cleanValue = value.replace(/[^\d.,]/g, '');
        
        // Replace dots (thousand separators) with empty string
        const withoutThousandSeparators = cleanValue.replace(/\./g, '');
        
        // Replace comma (decimal separator) with dot for JavaScript parsing
        const withDotDecimal = withoutThousandSeparators.replace(',', '.');
        
        return parseFloat(withDotDecimal) || 0;
    };

    // Calculate row total
    const getRowTotal = (item: ItemFormData): number => {
        const quantity = parseFormattedNumber(item.quantity);
        const unitCost = parseFormattedNumber(item.unit_cost);
        return quantity * unitCost;
    };

    // Calculate grand total
    const getGrandTotal = (): number => {
        return items.reduce((total, item) => total + getRowTotal(item), 0);
    };

    // Submit form
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate
            if (items.length === 0) {
                setError("Vui lòng thêm ít nhất một sản phẩm.");
                return;
            }

            const invalidItems = items.filter(item => !item.product_id || parseFormattedNumber(item.quantity) <= 0 || parseFormattedNumber(item.unit_cost) <= 0);
            if (invalidItems.length > 0) {
                setError("Vui lòng chọn sản phẩm và nhập số lượng và đơn giá hợp lệ cho tất cả các dòng.");
                return;
            }

            // Prepare data
            const requestData: CreateInventoryReceiptRequest = {
                user_id: 1, // TODO: Get from auth context
                receipt_date: receiptDate + ":00+07:00",
                notes: notes || undefined,
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: parseFormattedNumber(item.quantity),
                    unit_cost: parseFormattedNumber(item.unit_cost),
                    notes: item.notes || undefined,
                })),
            };

            const result = await inventoryReceiptApi.create(requestData);
            router.push(`/inventory-receipts/${result.code}`);
        } catch (err: any) {
            console.error("Error creating inventory receipt:", err);
            setError(extractErrorMessage(err, "Không thể tạo phiếu nhập kho. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Tạo Phiếu Nhập Kho
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Thông Tin Phiếu Nhập
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <TextField
                            label="Ngày nhập"
                            type="datetime-local"
                            value={receiptDate}
                            onChange={(e) => setReceiptDate(e.target.value)}
                            sx={{ minWidth: 200 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <TextField
                        label="Ghi chú"
                        multiline
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        placeholder="Ghi chú về phiếu nhập (tùy chọn)"
                    />
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6">
                            Danh Sách Sản Phẩm
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addItem}
                            disabled={loadingProducts}
                        >
                            Thêm Sản Phẩm
                        </Button>
                    </Box>

                    {items.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                            Chưa có sản phẩm nào. Nhấn &ldquo;Thêm Sản Phẩm&rdquo; để bắt đầu.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="30%"><strong>Sản Phẩm</strong></TableCell>
                                        <TableCell width="10%"><strong>Đơn Vị</strong></TableCell>
                                        <TableCell width="12%"><strong>Số Lượng</strong></TableCell>
                                        <TableCell width="12%"><strong>Đơn Giá (VND)</strong></TableCell>
                                        <TableCell width="12%"><strong>Thành Tiền (VND)</strong></TableCell>
                                        <TableCell width="14%"><strong>Ghi Chú</strong></TableCell>
                                        <TableCell width="10%" align="center"><strong>Thao Tác</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.tempId}>
                                            <TableCell>
                                                <Autocomplete
                                                    value={item.product || null}
                                                    onChange={(_, newValue) => handleProductChange(item.tempId, newValue)}
                                                    options={products}
                                                    getOptionLabel={(option) => option.name}
                                                    loading={loadingProducts}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Chọn sản phẩm..."
                                                            size="small"
                                                        />
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.product?.unit?.name || "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^\d.,]/g, '');
                                                        const number = parseFloat(rawValue.replace(/\./g, '').replace(',', '.')) || 0;
                                                        const formattedValue = formatNumber(number);
                                                        updateItem(item.tempId, "quantity", formattedValue);
                                                    }}
                                                    size="small"
                                                    placeholder="Số lượng"
                                                    inputProps={{ 
                                                        min: 0,
                                                        style: { textAlign: 'right' }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={item.unit_cost}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^\d.,]/g, '');
                                                        updateItem(item.tempId, "unit_cost", rawValue);
                                                    }}
                                                    size="small"
                                                    placeholder="Đơn giá"
                                                    inputProps={{ 
                                                        min: 0,
                                                        style: { textAlign: 'right' }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {formatPrice(getRowTotal(item))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={item.notes}
                                                    onChange={(e) => updateItem(item.tempId, "notes", e.target.value)}
                                                    size="small"
                                                    placeholder="Ghi chú..."
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    onClick={() => removeItem(item.tempId)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Tổng Cộng:
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" fontWeight="bold" color="primary">
                                                    {formatPrice(getGrandTotal())}
                                                </Typography>
                                            </TableCell>
                                            <TableCell colSpan={2}></TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Hủy
                </Button>
                <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={loading}
                    startIcon={<SaveIcon />}
                    disabled={items.length === 0}
                >
                    Tạo Phiếu Nhập
                </LoadingButton>
            </Box>
        </Box>
    );
} 