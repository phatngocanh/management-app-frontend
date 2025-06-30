"use client";

import { useRouter } from "next/navigation";
import { useCallback,useEffect, useState } from "react";

import { customerApi } from "@/lib/customers";
import { ordersApi } from "@/lib/orders";
import { productApi } from "@/lib/products";
import {
    CreateOrderRequest,
    CustomerResponse,
    InventoryResponse,
    ProductResponse,
} from "@/types";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
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
    delivery_status: string;
    debt_status: string;
    additional_cost: number;
    additional_cost_note: string;
    order_items: OrderItemFormData[];
}

interface OrderItemFormData {
    product_id: number;
    number_of_boxes?: number;
    spec?: number;
    quantity: number;
    selling_price: number;
    discount: number;
    final_amount?: number;
    version: string;
    export_from?: string;
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
        delivery_status: "PENDING",
        debt_status: "",
        additional_cost: 0,
        additional_cost_note: "",
        order_items: [],
    });

    // Data for dropdowns
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [inventories, setInventories] = useState<InventoryResponse[]>([]);

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

    const loadInventories = useCallback(async () => {
        try {
            const productIds = products.map(p => p.id);
            const inventoryPromises = productIds.map(id => 
                productApi.getInventory(id)
            );
            const inventoryData = await Promise.all(inventoryPromises);
            setInventories(inventoryData);
        } catch (err) {
            console.error("Error loading inventories:", err);
        }
    }, [products]);

    // Load inventories when products change
    useEffect(() => {
        if (products.length > 0) {
            loadInventories();
        }
    }, [products, loadInventories]);

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
            
            // Reload inventories after products are loaded
            if (products.length > 0) {
                await loadInventories();
            }
            
            // Update versions for existing order items
            setFormData(prev => {
                const updatedItems = prev.order_items.map(item => {
                    if (item.product_id > 0) {
                        const inventory = getInventoryForProduct(item.product_id);
                        return {
                            ...item,
                            version: inventory ? inventory.version : '',
                        };
                    }
                    return item;
                });
                
                return {
                    ...prev,
                    order_items: updatedItems,
                };
            });
            
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

    const getInventoryForProduct = (productId: number): InventoryResponse | undefined => {
        return inventories.find(inv => inv.product_id === productId);
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
            discount: 0,
            version: "",
            export_from: "",
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

    const updateOrderItem = (index: number, field: keyof OrderItemFormData, value: any) =>
        setFormData(prev => {
            const updatedItems = [...prev.order_items];
            let item = { ...updatedItems[index], [field]: value };

            // If product_id changes, clear all other fields
            if (field === 'product_id') {
                const inventory = getInventoryForProduct(value);
                item = {
                    product_id: value,
                    number_of_boxes: undefined,
                    spec: undefined,
                    quantity: 0,
                    selling_price: 0,
                    discount: 0,
                    final_amount: undefined,
                    version: inventory ? inventory.version : '',
                    export_from: '',
                };
            }

            // Handle spec, boxes, and quantity logic
            if (field === 'number_of_boxes' || field === 'spec') {
                // If both number_of_boxes and spec are provided, calculate quantity
                if (item.number_of_boxes && item.spec) {
                    item.quantity = item.number_of_boxes * item.spec;
                } else if (field === 'number_of_boxes' && item.number_of_boxes && !item.spec) {
                    // If only number_of_boxes is provided, auto-fill with product's default spec
                    const product = getProductById(item.product_id);
                    if (product && product.spec) {
                        item.spec = product.spec;
                        item.quantity = item.number_of_boxes * product.spec;
                    }
                } else if (field === 'spec' && item.spec && !item.number_of_boxes) {
                    // If only spec is provided, clear quantity (user needs to enter boxes or quantity manually)
                    item.quantity = 0;
                } else if ((field === 'number_of_boxes' && !item.number_of_boxes) || 
                          (field === 'spec' && !item.spec)) {
                    // If either field is cleared, clear quantity
                    item.quantity = 0;
                }
            }

            // If quantity is explicitly set, clear both number_of_boxes and spec
            if (field === 'quantity') {
                item.number_of_boxes = undefined;
                item.spec = undefined;
            }

            // Calculate final_amount whenever quantity, selling_price, or discount changes
            if (field === 'quantity' || field === 'selling_price' || field === 'discount') {
                const itemTotal = item.quantity * item.selling_price;
                const discountAmount = (itemTotal * item.discount) / 100;
                item.final_amount = itemTotal - discountAmount;
            }

            updatedItems[index] = item;
            return {
                ...prev,
                order_items: updatedItems,
            };
        });

    const getInventoryWarning = (productId: number, quantity: number, exportFrom: string) => {
        if (productId === 0 || quantity === 0) return null;
        
        const inventory = getInventoryForProduct(productId);
        if (!inventory) return null;

        if (exportFrom === "INVENTORY" && quantity > inventory.quantity) {
            return `Số lượng vượt quá tồn kho (${inventory.quantity} đơn vị). Vui lòng chọn nguồn xuất "Từ bên ngoài" hoặc giảm số lượng.`;
        }
        return null;
    };

    const isSpecDisabled = (item: OrderItemFormData) => {
        // Spec is disabled if quantity was manually entered (not calculated from number_of_boxes × spec)
        return !!(item.quantity > 0 && !item.number_of_boxes && !item.spec);
    };

    const isBoxesDisabled = (item: OrderItemFormData) => {
        // Boxes is disabled if quantity was manually entered (not calculated from number_of_boxes × spec)
        return !!(item.quantity > 0 && !item.number_of_boxes && !item.spec);
    };

    const hasProductFromSource = (productId: number, exportFrom: string, currentIndex: number) => {
        if (!exportFrom) return false; // Don't disable if no source selected yet
        return formData.order_items.some((item, index) => 
            index !== currentIndex && 
            item.product_id === productId && 
            item.export_from === exportFrom
        );
    };

    const calculateOrderTotal = () => {
        return formData.order_items.reduce((total, item) => {
            return total + (item.final_amount || 0);
        }, 0);
    };

    const calculateTotalProfitLoss = () => {
        return formData.order_items.reduce((total, item) => {
            const product = getProductById(item.product_id);
            if (product && item.quantity > 0 && item.selling_price > 0) {
                const originalCost = item.quantity * product.original_price;
                const sellingRevenue = item.quantity * item.selling_price;
                const discountAmount = (sellingRevenue * item.discount) / 100;
                const finalRevenue = sellingRevenue - discountAmount;
                const profitLoss = finalRevenue - originalCost;
                return total + profitLoss;
            }
            return total;
        }, 0);
    };

    const calculateTotalProfitLossPercentage = () => {
        const totalOriginalCost = formData.order_items.reduce((total, item) => {
            const product = getProductById(item.product_id);
            if (product && item.quantity > 0) {
                return total + (item.quantity * product.original_price);
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
                if (!item.export_from || (item.export_from !== "INVENTORY" && item.export_from !== "EXTERNAL")) {
                    throw new Error(`Vui lòng chọn nguồn xuất cho dòng ${i + 1}`);
                }

                // Get inventory version
                const inventory = getInventoryForProduct(item.product_id);
                if (inventory) {
                    updateOrderItem(i, "version", inventory.version);
                }
            }

            const request: CreateOrderRequest = {
                customer_id: formData.customer_id,
                order_date: new Date(formData.order_date).toISOString(),
                delivery_status: formData.delivery_status,
                debt_status: formData.debt_status,
                additional_cost: formData.additional_cost || 0,
                additional_cost_note: formData.additional_cost_note || "",
                order_items: formData.order_items.map(item => ({
                    product_id: item.product_id,
                    number_of_boxes: item.number_of_boxes,
                    spec: item.spec,
                    quantity: item.quantity,
                    selling_price: item.selling_price,
                    discount: item.discount,
                    final_amount: item.final_amount,
                    version: item.version,
                    export_from: item.export_from as string,
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
                router.push("/orders");
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
                                        <FormControl fullWidth>
                                            <InputLabel>Trạng thái giao hàng</InputLabel>
                                            <Select
                                                value={formData.delivery_status}
                                                onChange={(e) => handleFormChange("delivery_status", e.target.value)}
                                                label="Trạng thái giao hàng"
                                            >
                                                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                                                <MenuItem value="DELIVERED">Đã giao hàng</MenuItem>
                                                <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
                                                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Trạng thái công nợ"
                                            value={formData.debt_status}
                                            onChange={(e) => handleFormChange("debt_status", e.target.value)}
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
                                        <Tooltip title="Cập nhật danh sách khách hàng, sản phẩm, tồn kho và phiên bản">
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
                                    const inventory = getInventoryForProduct(item.product_id);
                                    const product = getProductById(item.product_id);
                                    const warning = getInventoryWarning(item.product_id, item.quantity, item.export_from || "");
                                    const originalPrice = item.quantity * item.selling_price;
                                    const discountAmount = (originalPrice * (item.discount || 0)) / 100;
                                    
                                    // Calculate profit/loss
                                    const originalCost = product ? item.quantity * product.original_price : 0;
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
                                                <Grid item xs={12} md={1.5}>
                                                    <Tooltip
                                                        title={isBoxesDisabled(item) ? "Số thùng bị khóa vì số lượng đã được nhập trực tiếp" : "Nhập số thùng để tính số lượng tự động"}
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            type="text"
                                                            label="Số thùng"
                                                            value={item.number_of_boxes !== undefined && item.number_of_boxes !== null && !isNaN(item.number_of_boxes) ? item.number_of_boxes.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, "");
                                                                updateOrderItem(index, "number_of_boxes", raw ? parseInt(raw) : undefined);
                                                            }}
                                                            placeholder="Tùy chọn"
                                                            disabled={item.product_id === 0 || isBoxesDisabled(item)}
                                                        />
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <Tooltip
                                                        title={isSpecDisabled(item) ? "Quy cách bị khóa vì số lượng đã được nhập trực tiếp" : "Nhập quy cách mỗi thùng để tính số lượng tự động"}
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            type="text"
                                                            label="Quy cách"
                                                            value={item.spec !== undefined && item.spec !== null && !isNaN(item.spec) ? item.spec.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, "");
                                                                updateOrderItem(index, "spec", raw ? parseInt(raw) : undefined);
                                                            }}
                                                            placeholder="Tùy chọn"
                                                            disabled={item.product_id === 0 || isSpecDisabled(item)}
                                                        />
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <Tooltip
                                                        title="Nhập số lượng trực tiếp hoặc sử dụng số thùng × quy cách"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            type="text"
                                                            label="Số lượng"
                                                            value={item.quantity !== undefined && item.quantity !== null && !isNaN(item.quantity) ? item.quantity.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, "");
                                                                updateOrderItem(index, "quantity", raw ? parseInt(raw) : 0);
                                                            }}
                                                            placeholder="Nhập số lượng"
                                                            disabled={item.product_id === 0}
                                                        />
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <Tooltip
                                                        title={
                                                            product && item.selling_price > 0 && product.original_price > 0
                                                                ? `Giá gốc: ${product.original_price.toLocaleString('vi-VN')} VND\nChênh lệch: ${(item.selling_price - product.original_price).toLocaleString('vi-VN')} VND\nBiên lợi nhuận: ${(((item.selling_price - product.original_price) / product.original_price) * 100).toFixed(1)}%`
                                                                : ""
                                                        }
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            type="text"
                                                            label="Giá bán"
                                                            value={item.selling_price !== undefined && item.selling_price !== null && !isNaN(item.selling_price) ? item.selling_price.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/\D/g, "");
                                                                updateOrderItem(index, "selling_price", raw ? parseInt(raw) : 0);
                                                            }}
                                                            disabled={item.product_id === 0}
                                                        />
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="Chiết khấu (%)"
                                                        value={item.discount === 0 || item.discount === undefined || item.discount === null ? "" : item.discount}
                                                        onChange={(e) => updateOrderItem(index, "discount", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                                                        placeholder=""
                                                        disabled={item.product_id === 0}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <FormControl fullWidth variant="outlined">
                                                        <InputLabel
                                                            id={`export-from-label-${index}`}
                                                            sx={{
                                                                backgroundColor: '#fff',
                                                                px: 0.5,
                                                                left: 8,
                                                                zIndex: 1,
                                                                pointerEvents: 'none',
                                                            }}
                                                            shrink
                                                        >
                                                            Nguồn xuất
                                                        </InputLabel>
                                                        <Select
                                                            labelId={`export-from-label-${index}`}
                                                            value={item.export_from || ""}
                                                            onChange={(e) => updateOrderItem(index, "export_from", e.target.value)}
                                                            label="Nguồn xuất"
                                                            displayEmpty
                                                            disabled={item.product_id === 0}
                                                            notched
                                                        >
                                                            <MenuItem value="" disabled />
                                                            <MenuItem 
                                                                value="INVENTORY"
                                                                disabled={hasProductFromSource(item.product_id, "INVENTORY", index)}
                                                            >
                                                                Từ kho
                                                            </MenuItem>
                                                            <MenuItem 
                                                                value="EXTERNAL"
                                                                disabled={hasProductFromSource(item.product_id, "EXTERNAL", index)}
                                                            >
                                                                Từ bên ngoài
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} md={1.5}>
                                                    <Tooltip
                                                        title={
                                                            (item.selling_price && item.quantity)
                                                                ? (
                                                                    <div>
                                                                        <div>Giá gốc: {(item.quantity * item.selling_price).toLocaleString('vi-VN')} VND</div>
                                                                        {item.discount > 0 && (
                                                                            <div>Đã giảm: {(((item.quantity * item.selling_price) * item.discount / 100) || 0).toLocaleString('vi-VN')} VND</div>
                                                                        )}
                                                                    </div>
                                                                )
                                                                : ""
                                                        }
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            type="text"
                                                            label="Thành tiền"
                                                            value={item.final_amount !== undefined && item.final_amount !== null && !isNaN(item.final_amount) ? item.final_amount.toLocaleString("vi-VN") : "0"}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Grid>
                                                <Grid item xs={12} md={1}>
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
                                                {`Giá vốn ${product.original_price.toLocaleString('vi-VN')}đ × ${item.quantity} = ${originalCost.toLocaleString('vi-VN')}, bán ${item.selling_price.toLocaleString('vi-VN')}đ × ${item.quantity} = ${(item.selling_price * item.quantity).toLocaleString('vi-VN')}` +
                                                  (item.discount > 0 ? `, chiết khấu ${item.discount}% (${discountAmount.toLocaleString('vi-VN')}đ) = còn ${(item.selling_price * item.quantity - discountAmount).toLocaleString('vi-VN')}` : '') +
                                                  ` → ${profitLoss >= 0 ? 'Lãi' : 'Lỗ'} ${Math.abs(profitLoss).toLocaleString('vi-VN')}đ (${profitLossPercentage >= 0 ? '+' : ''}${profitLossPercentage.toFixed(1)}%)`
                                                }
                                              </Box>
                                            )}
                                            {inventory && (
                                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                                    Tồn kho: {inventory.quantity} đơn vị
                                                </Typography>
                                            )}
                                            {warning && (
                                                <Alert severity="warning" sx={{ mt: 1 }}>
                                                    {warning}
                                                </Alert>
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
                                                const total = calculateOrderTotal();
                                                const additionalCost = formData.additional_cost || 0;
                                                const totalAfterCost = total + additionalCost;
                                                const additionalCostSign = additionalCost > 0 ? '+' : (additionalCost < 0 ? '-' : '');
                                                return (
                                                    <Typography variant="h6">
                                                        Tổng tiền đơn hàng: {total.toLocaleString("vi-VN")} VND
                                                        {additionalCost !== 0 && (
                                                            <>
                                                                {' '}{additionalCostSign}{Math.abs(additionalCost).toLocaleString("vi-VN")} Phí phụ thêm = <b>{totalAfterCost.toLocaleString("vi-VN")} VND</b>
                                                            </>
                                                        )}
                                                    </Typography>
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
                                onClick={() => router.push("/orders")}
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