"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { customerApi } from "@/lib/customers";
import { ordersApi } from "@/lib/orders";
import { productApi } from "@/lib/products";
import {
    CreateOrderRequest,
    CustomerResponse,
    ProductResponse,
} from "@/types";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

interface OrderFormData {
    customer_id: number;
    order_date: string;
    note: string;
    additional_cost: number;
    additional_cost_note: string;
    tax_percent: number;
    delivery_status: string;
    order_items: OrderItemFormData[];
}

interface OrderItemFormData {
    product_id: number;
    quantity: number;
    selling_price: number;
    original_price: number;
    discount_percent: number;
    final_amount?: number;
}

const STORAGE_KEY = "order_form_data";

export default function CreateOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

    // Form data
    const [formData, setFormData] = useState<OrderFormData>({
        customer_id: 0,
        order_date: new Date().toISOString().split("T")[0],
        note: "",
        additional_cost: 0,
        additional_cost_note: "",
        tax_percent: 0,
        delivery_status: "PENDING",
        order_items: [],
    });

    // Data for dropdowns
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);

    // Load saved form data from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(parsed);
            } catch (err) {
                console.error("Error parsing saved form data:", err);
            }
        }
    }, []);

    // Load customers and products
    useEffect(() => {
        loadCustomers();
        loadProducts();
        setLastRefreshTime(new Date());
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await customerApi.getAll();
            setCustomers(response);
        } catch (err) {
            console.error("Error loading customers:", err);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await productApi.getAll();
            setProducts(response);
        } catch (err) {
            console.error("Error loading products:", err);
        }
    };

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);

    const refreshAllData = async () => {
        try {
            setRefreshing(true);
            setError(null);
            
            // Reload all data
            await Promise.all([
                loadCustomers(),
                loadProducts(),
            ]);
            
            setSuccess("Đã cập nhật dữ liệu thành công!");
            setLastRefreshTime(new Date());
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
            
        } catch (err) {
            setError("Không thể cập nhật dữ liệu. Vui lòng thử lại.");
            console.error("Error refreshing data:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const getProductById = (productId: number): ProductResponse | undefined => {
        return products.find(p => p.id === productId);
    };

    const handleFormChange = (field: keyof OrderFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const addOrderItem = () => {
        const newItem: OrderItemFormData = {
            product_id: 0,
            quantity: 0,
            selling_price: 0,
            original_price: 0,
            discount_percent: 0,
        };
        setFormData(prev => ({
            ...prev,
            order_items: [...prev.order_items, newItem],
        }));
    };

    const removeOrderItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            order_items: prev.order_items.filter((_, i) => i !== index),
        }));
    };

    const updateOrderItem = (index: number, field: keyof OrderItemFormData, value: any) => {
        setFormData(prev => {
            const updatedItems = [...prev.order_items];
            let item = { ...updatedItems[index], [field]: value };

            // If product_id changes, auto-fill original_price
            if (field === 'product_id') {
                const product = getProductById(value);
                item = {
                    product_id: value,
                    quantity: 0,
                    selling_price: 0,
                    original_price: product ? product.cost : 0,
                    discount_percent: 0,
                };
            }

            // Calculate final_amount whenever quantity, selling_price, or discount_percent changes
            if (field === 'quantity' || field === 'selling_price' || field === 'discount_percent') {
                const itemTotal = item.quantity * item.selling_price;
                const discountAmount = (itemTotal * item.discount_percent) / 100;
                item.final_amount = itemTotal - discountAmount;
            }

            updatedItems[index] = item;
            return {
                ...prev,
                order_items: updatedItems,
            };
        });
    };

    const calculateTotalProfitLoss = () => {
        return formData.order_items.reduce((total, item) => {
            if (item.quantity > 0 && item.selling_price > 0) {
                const originalCost = item.quantity * item.original_price;
                const sellingRevenue = item.quantity * item.selling_price;
                const discountAmount = (sellingRevenue * item.discount_percent) / 100;
                const finalRevenue = sellingRevenue - discountAmount;
                const profitLoss = finalRevenue - originalCost;
                return total + profitLoss;
            }
            return total;
        }, 0);
    };

    const calculateTotalProfitLossPercentage = () => {
        const totalOriginalCost = formData.order_items.reduce((total, item) => {
            if (item.quantity > 0) {
                return total + (item.quantity * item.original_price);
            }
            return total;
        }, 0);

        const additionalCost = typeof formData.additional_cost === 'number' ? formData.additional_cost : 0;

        if (totalOriginalCost > 0) {
            return ((calculateTotalProfitLoss() + additionalCost) / totalOriginalCost) * 100;
        }
        return 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate form
            if (formData.customer_id === 0) {
                throw new Error("Vui lòng chọn khách hàng");
            }
            if (formData.order_items.length === 0) {
                throw new Error("Vui lòng thêm ít nhất một sản phẩm");
            }

            // Validate order items
            for (let i = 0; i < formData.order_items.length; i++) {
                const item = formData.order_items[i];
                if (item.product_id === 0) {
                    throw new Error(`Vui lòng chọn sản phẩm cho dòng ${i + 1}`);
                }
                if (item.quantity <= 0) {
                    throw new Error(`Số lượng phải lớn hơn 0 cho dòng ${i + 1}`);
                }
                if (item.selling_price <= 0) {
                    throw new Error(`Giá bán phải lớn hơn 0 cho dòng ${i + 1}`);
                }
                if (item.original_price <= 0) {
                    throw new Error(`Giá gốc phải lớn hơn 0 cho dòng ${i + 1}`);
                }
            }

            const request: CreateOrderRequest = {
                customer_id: formData.customer_id,
                order_date: new Date(formData.order_date).toISOString(),
                note: formData.note || undefined,
                additional_cost: formData.additional_cost || 0,
                additional_cost_note: formData.additional_cost_note || undefined,
                tax_percent: formData.tax_percent || 0,
                delivery_status: formData.delivery_status,
                items: formData.order_items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    selling_price: item.selling_price,
                    original_price: item.original_price,
                    discount_percent: item.discount_percent || 0,
                })),
            };

            await ordersApi.create(request);
            setSuccess("Tạo đơn hàng thành công!");
            
            // Clear localStorage
            localStorage.removeItem(STORAGE_KEY);
            
            // Refresh pending orders count in header
            if ((window as any).refreshPendingOrdersCount) {
                (window as any).refreshPendingOrdersCount();
            }
            
            // Redirect after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err: any) {
            // Extract error message from backend response
            let errorMessage = "Có lỗi xảy ra khi tạo đơn hàng";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Tạo đơn hàng mới
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Order Information */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin đơn hàng
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Khách hàng</InputLabel>
                                            <Select
                                                value={formData.customer_id}
                                                onChange={(e) => handleFormChange("customer_id", e.target.value)}
                                                label="Khách hàng"
                                            >
                                                <MenuItem value={0}>Chọn khách hàng</MenuItem>
                                                {customers.map((customer) => (
                                                    <MenuItem key={customer.id} value={customer.id}>
                                                        {customer.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Ngày đặt hàng"
                                            value={formData.order_date}
                                            onChange={(e) => handleFormChange("order_date", e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="text"
                                            label="Chi phí phụ thêm (VND)"
                                            value={
                                                typeof formData.additional_cost === 'string' && (formData.additional_cost === '' || formData.additional_cost === '-')
                                                    ? formData.additional_cost
                                                    : Number(formData.additional_cost).toLocaleString('vi-VN')
                                            }
                                            onChange={(e) => {
                                                let raw = e.target.value.replace(/[^\d-]/g, "");
                                                // Only allow a single leading minus
                                                if (raw.startsWith("-")) {
                                                    raw = "-" + raw.slice(1).replace(/-/g, "");
                                                } else {
                                                    raw = raw.replace(/-/g, "");
                                                }
                                                if (raw === "" || raw === "-") {
                                                    handleFormChange("additional_cost", raw);
                                                } else {
                                                    handleFormChange("additional_cost", Number(raw));
                                                }
                                            }}
                                            placeholder="0"
                                            InputProps={{
                                                inputProps: {
                                                    step: 1,
                                                },
                                                endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Ghi chú chi phí phụ thêm"
                                            value={formData.additional_cost_note}
                                            onChange={(e) => handleFormChange("additional_cost_note", e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Thuế (%)"
                                            value={formData.tax_percent}
                                            onChange={(e) => handleFormChange("tax_percent", Number(e.target.value))}
                                            placeholder="0"
                                            InputProps={{
                                                inputProps: {
                                                    min: 0,
                                                    max: 100,
                                                    step: 1,
                                                },
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Trạng thái giao hàng</InputLabel>
                                            <Select
                                                value={formData.delivery_status}
                                                onChange={(e) => handleFormChange("delivery_status", e.target.value)}
                                                label="Trạng thái giao hàng"
                                            >
                                                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                                                <MenuItem value="DELIVERED">Đã giao</MenuItem>
                                                <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
                                                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Ghi chú đơn hàng"
                                            value={formData.note}
                                            onChange={(e) => handleFormChange("note", e.target.value)}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Order Items */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6">
                                            Sản phẩm trong đơn hàng
                                        </Typography>
                                        {lastRefreshTime && (
                                            <Typography variant="caption" color="textSecondary">
                                                Cập nhật lần cuối: {lastRefreshTime.toLocaleTimeString('vi-VN')}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Tooltip title="Cập nhật danh sách khách hàng và sản phẩm">
                                            <Button
                                                startIcon={<RefreshIcon />}
                                                onClick={refreshAllData}
                                                variant="outlined"
                                                disabled={refreshing}
                                            >
                                                {refreshing ? "Đang cập nhật..." : "Cập nhật dữ liệu"}
                                            </Button>
                                        </Tooltip>
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={addOrderItem}
                                            variant="outlined"
                                        >
                                            Thêm sản phẩm
                                        </Button>
                                    </Box>
                                </Box>

                                {formData.order_items.map((item, index) => {
                                    const product = getProductById(item.product_id);
                                    const originalPrice = item.quantity * item.selling_price;
                                    const discountAmount = (originalPrice * (item.discount_percent || 0)) / 100;
                                    
                                    // Calculate profit/loss
                                    const originalCost = item.quantity * item.original_price;
                                    const sellingRevenue = item.quantity * item.selling_price;
                                    const finalRevenue = sellingRevenue - discountAmount;
                                    const profitLoss = finalRevenue - originalCost;
                                    const profitLossPercentage = originalCost > 0 ? (profitLoss / originalCost) * 100 : 0;
                                    
                                    return (
                                        <Paper key={index} sx={{ p: 2, mb: 2 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={2}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Sản phẩm</InputLabel>
                                                        <Select
                                                            value={item.product_id}
                                                            onChange={(e) => updateOrderItem(index, "product_id", e.target.value)}
                                                            label="Sản phẩm"
                                                        >
                                                            <MenuItem value={0}>Chọn sản phẩm</MenuItem>
                                                            {products.map((product) => (
                                                                <MenuItem key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="Số lượng"
                                                        value={item.quantity}
                                                        onChange={(e) => updateOrderItem(index, "quantity", Number(e.target.value))}
                                                        placeholder="Nhập số lượng"
                                                        disabled={item.product_id === 0}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="Giá vốn"
                                                        value={item.original_price}
                                                        onChange={(e) => updateOrderItem(index, "original_price", Number(e.target.value))}
                                                        disabled={item.product_id === 0}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="Giá bán"
                                                        value={item.selling_price}
                                                        onChange={(e) => updateOrderItem(index, "selling_price", Number(e.target.value))}
                                                        disabled={item.product_id === 0}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="Chiết khấu (%)"
                                                        value={item.discount_percent}
                                                        onChange={(e) => updateOrderItem(index, "discount_percent", Number(e.target.value))}
                                                        placeholder="0"
                                                        disabled={item.product_id === 0}
                                                        InputProps={{
                                                            inputProps: {
                                                                min: 0,
                                                                max: 100,
                                                                step: 1,
                                                            },
                                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <TextField
                                                        fullWidth
                                                        type="text"
                                                        label="Thành tiền"
                                                        value={item.final_amount !== undefined && item.final_amount !== null && !isNaN(item.final_amount) ? item.final_amount.toLocaleString("vi-VN") : "0"}
                                                        InputProps={{
                                                            readOnly: true,
                                                            endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={0.5}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeOrderItem(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                            {/* Info bar below the row */}
                                            {product && (
                                                <Box sx={{ mt: 1, fontSize: 15, color: profitLoss >= 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                                                    {`Giá vốn ${item.original_price.toLocaleString('vi-VN')}đ × ${item.quantity} = ${originalCost.toLocaleString('vi-VN')}đ, bán ${item.selling_price.toLocaleString('vi-VN')}đ × ${item.quantity} = ${(item.selling_price * item.quantity).toLocaleString('vi-VN')}đ` +
                                                        (item.discount_percent > 0 ? `, chiết khấu ${item.discount_percent}% (${discountAmount.toLocaleString('vi-VN')}đ) = còn ${(item.selling_price * item.quantity - discountAmount).toLocaleString('vi-VN')}đ` : '') +
                                                        ` → ${profitLoss >= 0 ? 'Lãi' : 'Lỗ'} ${Math.abs(profitLoss).toLocaleString('vi-VN')}đ (${profitLossPercentage >= 0 ? '+' : ''}${profitLossPercentage.toFixed(1)}%)`
                                                    }
                                                </Box>
                                            )}
                                        </Paper>
                                    );
                                })}

                                {formData.order_items.length === 0 && (
                                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                                        Chưa có sản phẩm nào. Vui lòng thêm sản phẩm vào đơn hàng.
                                    </Typography>
                                )}

                                {/* Order Total */}
                                {formData.order_items.length > 0 && (
                                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                            {(() => {
                                                const itemsTotal = formData.order_items.reduce((total, item) => {
                                                    return total + (item.final_amount || 0);
                                                }, 0);
                                                const additionalCost = formData.additional_cost || 0;
                                                const subtotal = itemsTotal + additionalCost;
                                                const taxAmount = Math.round((subtotal * formData.tax_percent) / 100);
                                                const finalTotal = subtotal + taxAmount;
                                                
                                                return (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Typography variant="body1">
                                                            Tổng sản phẩm: {itemsTotal.toLocaleString("vi-VN")} VND
                                                        </Typography>
                                                        {additionalCost !== 0 && (
                                                            <Typography variant="body1">
                                                                Chi phí phụ thêm: {additionalCost >= 0 ? '+' : ''}{additionalCost.toLocaleString("vi-VN")} VND
                                                            </Typography>
                                                        )}
                                                        <Typography variant="body1">
                                                            Tạm tính: {subtotal.toLocaleString("vi-VN")} VND
                                                        </Typography>
                                                        {formData.tax_percent > 0 && (
                                                            <Typography variant="body1">
                                                                Thuế ({formData.tax_percent}%): +{taxAmount.toLocaleString("vi-VN")} VND
                                                            </Typography>
                                                        )}
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #ccc', pt: 1 }}>
                                                            Tổng cộng: {finalTotal.toLocaleString("vi-VN")} VND
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
                                            {(() => {
                                                const totalProfitLoss = calculateTotalProfitLoss() + (formData.additional_cost || 0);
                                                const totalProfitLossPercentage = calculateTotalProfitLossPercentage();
                                                if (totalProfitLoss !== 0) {
                                                    return (
                                                        <Typography 
                                                            variant="body1" 
                                                            sx={{ 
                                                                color: totalProfitLoss >= 0 ? '#059669' : '#dc2626',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            Tổng {totalProfitLoss >= 0 ? 'lãi' : 'lỗ'}: {Math.abs(totalProfitLoss).toLocaleString("vi-VN")} VND ({totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(1)}%)
                                                        </Typography>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.push("/dashboard")}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? "Đang tạo..." : "Tạo đơn hàng"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
} 