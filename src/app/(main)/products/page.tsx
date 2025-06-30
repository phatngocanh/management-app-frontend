"use client";

import { useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import { categoryApi } from "@/lib/categories";
import { extractErrorMessage } from "@/lib/error-utils";
import { inventoryApi } from "@/lib/inventory";
import { productApi } from "@/lib/products";
import { unitApi } from "@/lib/units";
import { ProductCategoryResponse, ProductResponse, UnitOfMeasureResponse, UpdateInventoryQuantityRequest,UpdateProductRequest } from "@/types";
import { Add as AddIcon, Edit as EditIcon, Inventory as InventoryIcon, Update as UpdateIcon } from "@mui/icons-material";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
    const [units, setUnits] = useState<UnitOfMeasureResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [selectedProductForInventory, setSelectedProductForInventory] = useState<ProductResponse | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<ProductCategoryResponse[]>([]);

    // Form data for product
    const [formData, setFormData] = useState<{
        name: string;
        cost: number;
        description: string;
        category_id?: number;
        unit_id?: number;
        operation_type: string;
    }>({
        name: "",
        cost: 0,
        description: "",
        category_id: undefined,
        unit_id: undefined,
        operation_type: "MANUFACTURING",
    });

    // Form data for inventory update
    const [inventoryFormData, setInventoryFormData] = useState<{
        quantity: number | "";
        note: string;
        version: string;
    }>({
        quantity: "",
        note: "",
        version: "",
    });

    // Focus quantity input when inventory dialog opens
    useEffect(() => {
        if (openInventoryDialog) {
            const timer = setTimeout(() => {
                const quantityInput = document.querySelector('input[name="inventory-quantity"]') as HTMLInputElement;
                if (quantityInput) {
                    quantityInput.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [openInventoryDialog]);

    // Load data
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Prepare category IDs for filtering
            const categoryIds = selectedCategories.map(cat => cat.id);

            // Load all data in parallel
            const [productsData, categoriesData, unitsData] = await Promise.all([
                productApi.getAll(categoryIds.length > 0 ? categoryIds : undefined),
                categoryApi.getAll(),
                unitApi.getAll(),
            ]);

            setProducts(productsData);
            setCategories(categoriesData);
            setUnits(unitsData);
        } catch (err: any) {
            console.error("Error loading data:", err);
            setError(extractErrorMessage(err, "Không thể tải dữ liệu. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Auto-reload when category filter changes
    useEffect(() => {
        if (categories.length > 0) { // Only auto-reload if categories are loaded
            loadData();
        }
    }, [selectedCategories]);

    // Handle product form submission
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            if (editingProduct) {
                const updateData: UpdateProductRequest = {
                    id: editingProduct.id,
                    name: formData.name,
                    cost: formData.cost,
                    description: formData.description || "",
                    category_id: formData.category_id,
                    unit_id: formData.unit_id,
                    operation_type: formData.operation_type,
                };
                await productApi.update(updateData);
            } else {
                const createData = {
                    name: formData.name,
                    cost: formData.cost,
                    description: formData.description || "",
                    category_id: formData.category_id,
                    unit_id: formData.unit_id,
                    operation_type: formData.operation_type,
                };
                await productApi.create(createData);
            }

            // Reset form and reload data
            setOpenDialog(false);
            setEditingProduct(null);
            setFormData({
                name: "",
                cost: 0,
                description: "",
                category_id: undefined,
                unit_id: undefined,
                operation_type: "MANUFACTURING",
            });
            await loadData();
        } catch (err: any) {
            console.error("Error submitting product:", err);
            setError(extractErrorMessage(err, editingProduct ? "Không thể cập nhật sản phẩm. Vui lòng thử lại." : "Không thể thêm sản phẩm. Vui lòng thử lại."));
        } finally {
            setSubmitting(false);
        }
    };

    // Handle inventory update submission
    const handleInventorySubmit = async () => {
        if (!selectedProductForInventory) return;
        
        try {
            setSubmitting(true);
            setError(null);

            const dataToSubmit: UpdateInventoryQuantityRequest = {
                quantity: inventoryFormData.quantity === "" ? 0 : inventoryFormData.quantity,
                note: inventoryFormData.note || undefined,
                version: inventoryFormData.version || "1",
            };

            await inventoryApi.updateQuantity(selectedProductForInventory.id, dataToSubmit);
            
            // Reset form and reload data
            setOpenInventoryDialog(false);
            setSelectedProductForInventory(null);
            setInventoryFormData({ quantity: "", note: "", version: "" });
            await loadData();
        } catch (err: any) {
            console.error("Error updating inventory:", err);
            setError(extractErrorMessage(err, "Không thể cập nhật số lượng kho. Vui lòng thử lại."));
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit product
    const handleEdit = (product: ProductResponse) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            cost: product.cost,
            description: product.description,
            category_id: product.category_id,
            unit_id: product.unit_id,
            operation_type: product.operation_type,
        });
        setOpenDialog(true);
    };

    // Handle inventory update
    const handleInventoryUpdate = (product: ProductResponse) => {
        setSelectedProductForInventory(product);
        setInventoryFormData({
            quantity: "",
            note: "",
            version: product.inventory?.version ?? "",
        });
        setOpenInventoryDialog(true);
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProduct(null);
        setFormData({
            name: "",
            cost: 0,
            description: "",
            category_id: undefined,
            unit_id: undefined,
            operation_type: "MANUFACTURING",
        });
        setError(null);
    };

    // Handle inventory dialog close
    const handleCloseInventoryDialog = () => {
        setOpenInventoryDialog(false);
        setSelectedProductForInventory(null);
        setInventoryFormData({ quantity: "", note: "", version: "" });
        setError(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Quản lý Sản phẩm
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled
                    >
                        Thêm Sản phẩm
                    </Button>
                </Box>
                <Card>
                    <CardContent>
                        <SkeletonLoader type="table" rows={8} columns={7} />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Quản lý Sản phẩm
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Thêm Sản phẩm
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Category Filter */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="h6" sx={{ minWidth: "auto" }}>
                            Bộ lọc:
                        </Typography>
                        <Autocomplete
                            multiple
                            options={categories}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={selectedCategories}
                            onChange={(_, newValue) => {
                                setSelectedCategories(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Lọc theo danh mục"
                                    placeholder="Chọn danh mục để lọc"
                                    size="small"
                                />
                            )}
                            sx={{ minWidth: 300, flexGrow: 1 }}
                            disabled={loading}
                        />
                        {selectedCategories.length > 0 && (
                            <Button
                                variant="outlined"
                                onClick={() => setSelectedCategories([])}
                                size="small"
                                color="secondary"
                            >
                                Xóa bộ lọc ({selectedCategories.length})
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên sản phẩm</TableCell>
                                    <TableCell>Giá vốn</TableCell>
                                    <TableCell>Loại sản phẩm</TableCell>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Đơn vị</TableCell>
                                    <TableCell>Số lượng kho</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {product.name}
                                                </Typography>
                                                {product.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatPrice(product.cost)}</TableCell>
                                        <TableCell>
                                            {product.operation_type === "MANUFACTURING" ? "Sản xuất" : 
                                             product.operation_type === "PACKAGING" ? "Đóng gói" : "Mua nguyên liệu"}
                                        </TableCell>
                                        <TableCell>
                                            {product.category ? product.category.name : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {product.unit ? product.unit.name : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {product.operation_type === "PURCHASE" ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {product.inventory ? product.inventory.quantity : "N/A"}
                                                    </Typography>
                                                    {product.unit && product.inventory && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {product.unit.name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                    Không áp dụng
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Chỉnh sửa Sản phẩm">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {product.operation_type === "PURCHASE" && (
                                                <>
                                                    <Tooltip title="Cập nhật số lượng kho">
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() => handleInventoryUpdate(product)}
                                                        >
                                                            <InventoryIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xem lịch sử kho">
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => window.location.href = `/inventory-history?product=${product.id}`}
                                                        >
                                                            <UpdateIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Product Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingProduct ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên sản phẩm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                            disabled={submitting}
                        />
                        <TextField
                            fullWidth
                            label="Giá vốn (VND)"
                            type="text"
                            value={formData.cost !== undefined && formData.cost !== null && !isNaN(formData.cost) ? formData.cost.toLocaleString("vi-VN") : ""}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setFormData({ ...formData, cost: raw ? Number(raw) : 0 });
                            }}
                            margin="normal"
                            required
                            disabled={submitting}
                            placeholder="0"
                        />
                        <Autocomplete
                            fullWidth
                            options={categories}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={categories.find(c => c.id === formData.category_id) || null}
                            onChange={(_, newValue) => {
                                setFormData({ ...formData, category_id: newValue?.id });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Danh mục"
                                    margin="normal"
                                    disabled={submitting}
                                />
                            )}
                            disabled={submitting}
                        />
                        <Autocomplete
                            fullWidth
                            options={units}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={units.find(u => u.id === formData.unit_id) || null}
                            onChange={(_, newValue) => {
                                setFormData({ ...formData, unit_id: newValue?.id });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Đơn vị tính"
                                    margin="normal"
                                    disabled={submitting}
                                />
                            )}
                            disabled={submitting}
                        />
                        <FormControl fullWidth margin="normal" disabled={submitting}>
                            <InputLabel>Loại sản phẩm</InputLabel>
                            <Select
                                value={formData.operation_type}
                                onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
                                label="Loại sản phẩm"
                                required
                            >
                                <MenuItem value="MANUFACTURING">Sản xuất (Manufacturing)</MenuItem>
                                <MenuItem value="PACKAGING">Đóng gói (Packaging)</MenuItem>
                                <MenuItem value="PURCHASE">Mua nguyên liệu (Purchase)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Mô tả"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            disabled={submitting}
                            placeholder="Nhập mô tả sản phẩm..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={submitting}>
                        Hủy
                    </Button>
                    <LoadingButton
                        onClick={handleSubmit}
                        variant="contained"
                        loading={submitting}
                        loadingText="Đang lưu..."
                        disabled={!formData.name || formData.cost < 0}
                    >
                        {editingProduct ? "Cập nhật" : "Thêm"}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Inventory Update Dialog */}
            <Dialog open={openInventoryDialog} onClose={handleCloseInventoryDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Cập nhật số lượng kho
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {selectedProductForInventory && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Sản phẩm
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {selectedProductForInventory.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Số lượng hiện tại: {selectedProductForInventory.inventory?.quantity || 0} {selectedProductForInventory.unit?.name || ""}
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            label="Số lượng mới"
                            type="number"
                            name="inventory-quantity"
                            value={inventoryFormData.quantity}
                            onChange={(e) => setInventoryFormData({ 
                                ...inventoryFormData, 
                                quantity: e.target.value === "" ? "" : Number(e.target.value) 
                            })}
                            margin="normal"
                            required
                            disabled={submitting}
                            placeholder="Nhập số lượng..."
                        />
                        <TextField
                            fullWidth
                            label="Ghi chú"
                            multiline
                            rows={3}
                            value={inventoryFormData.note}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, note: e.target.value })}
                            margin="normal"
                            disabled={submitting}
                            placeholder="Nhập ghi chú (tùy chọn)..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseInventoryDialog} disabled={submitting}>
                        Hủy
                    </Button>
                    <LoadingButton
                        onClick={handleInventorySubmit}
                        variant="contained"
                        loading={submitting}
                        loadingText="Đang cập nhật..."
                        disabled={inventoryFormData.quantity === "" || inventoryFormData.quantity < 0}
                    >
                        Cập nhật số lượng
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 