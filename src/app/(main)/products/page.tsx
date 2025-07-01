"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import ImageUpload from "@/components/ImageUpload";
import LoadingButton from "@/components/LoadingButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import { categoryApi } from "@/lib/categories";
import { extractErrorMessage } from "@/lib/error-utils";
import { inventoryApi } from "@/lib/inventory";
import { productApi, productImagesApi } from "@/lib/products";
import { unitApi } from "@/lib/units";
import { ProductCategoryResponse, ProductResponse, UnitOfMeasureResponse, UpdateInventoryQuantityRequest,UpdateProductRequest } from "@/types";
import { Add as AddIcon, Edit as EditIcon, Inventory as InventoryIcon, Update as UpdateIcon, Image as ImageIcon } from "@mui/icons-material";
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
    const [imageOperationLoading, setImageOperationLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [selectedProductForInventory, setSelectedProductForInventory] = useState<ProductResponse | null>(null);
    const [selectedProductForImages, setSelectedProductForImages] = useState<ProductResponse | null>(null);
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

    // Add a new state for the cost input as string
    const [costInput, setCostInput] = useState<string>("");

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

    // When opening the dialog for edit, set costInput to formatted string
    useEffect(() => {
        if (openDialog) {
            setCostInput(
                formData.cost !== undefined && formData.cost !== null && !isNaN(formData.cost)
                    ? formData.cost.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 3 })
                    : ""
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openDialog]);

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
    };

    // Handle image upload
    const handleImageUpload = async (file: File) => {
        if (!selectedProductForImages) return;

        try {
            setImageOperationLoading(true);
            setError(null);
            await productImagesApi.uploadImage(selectedProductForImages.id, file);
            // Reload the products to get updated images
            await loadData();
            // Update the selected product with fresh data
            const updatedProduct = await productApi.getOne(selectedProductForImages.id);
            setSelectedProductForImages(updatedProduct);
        } catch (error) {
            console.error("Error uploading image:", error);
            setError(extractErrorMessage(error as any, "Không thể tải ảnh lên. Vui lòng thử lại."));
            throw error;
        } finally {
            setImageOperationLoading(false);
        }
    };

    // Handle image delete
    const handleImageDelete = async (imageId: number) => {
        if (!selectedProductForImages) return;

        try {
            setImageOperationLoading(true);
            setError(null);
            await productImagesApi.deleteImage(selectedProductForImages.id, imageId);
            // Reload the products to get updated images
            await loadData();
            // Update the selected product with fresh data
            const updatedProduct = await productApi.getOne(selectedProductForImages.id);
            setSelectedProductForImages(updatedProduct);
        } catch (error) {
            console.error("Error deleting image:", error);
            setError(extractErrorMessage(error as any, "Không thể xóa ảnh. Vui lòng thử lại."));
            throw error;
        } finally {
            setImageOperationLoading(false);
        }
    };

    // Handle image dialog
    const handleImageManagement = (product: ProductResponse) => {
        setSelectedProductForImages(product);
        setError(null);
        setOpenImageDialog(true);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setSelectedProductForImages(null);
        setError(null);
    };



    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }).format(price);
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(number);
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
                                    <TableCell>Mã SP</TableCell>
                                    <TableCell>Tên sản phẩm</TableCell>
                                    <TableCell>Giá vốn</TableCell>
                                    <TableCell>Loại sản phẩm</TableCell>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Đơn vị</TableCell>
                                    <TableCell>Số lượng kho</TableCell>
                                    <TableCell>Hình ảnh</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.code}</TableCell>
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
                                                        {product.inventory ? formatNumber(product.inventory.quantity) : "N/A"}
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
                                            {product.operation_type === "MANUFACTURING" || product.operation_type === "PACKAGING" ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    {/* Image thumbnail */}
                                                    <Box sx={{ 
                                                        width: 60, 
                                                        height: 60, 
                                                        borderRadius: 1, 
                                                        overflow: "hidden",
                                                        border: "1px solid #e0e0e0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: "grey.50"
                                                    }}>
                                                        {product.images && product.images.length > 0 ? (
                                                            <Image
                                                                src={product.images[0].image_url}
                                                                alt={`${product.name} - Ảnh 1`}
                                                                width={60}
                                                                height={60}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            <ImageIcon sx={{ color: "grey.400", fontSize: 24 }} />
                                                        )}
                                                    </Box>
                                                    
                                                    {/* Image count and manage button */}
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                        <Typography variant="body2">
                                                            {product.images?.length || 0} ảnh
                                                        </Typography>
                                                        <Tooltip title="Quản lý hình ảnh">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleImageManagement(product)}
                                                                color="primary"
                                                                sx={{ alignSelf: "flex-start" }}
                                                            >
                                                                <ImageIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Không khả dụng
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
                            value={costInput}
                            onChange={(e) => {
                                // Allow digits, dots, and commas
                                let raw = e.target.value.replace(/[^\d.,]/g, "");
                                // Only allow one decimal separator
                                const parts = raw.split(/[.,]/);
                                if (parts.length > 2) {
                                    raw = parts[0] + "." + parts.slice(1).join("");
                                } else {
                                    raw = raw.replace(",", ".");
                                }
                                setCostInput(raw);
                            }}
                            onBlur={() => {
                                const normalized = costInput.replace(/,/g, ".");
                                const num = parseFloat(normalized);
                                setFormData({ ...formData, cost: isNaN(num) ? 0 : num });
                                setCostInput(isNaN(num) ? "" : num.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 3 }));
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

            {/* Image Management Dialog */}
            <Dialog open={openImageDialog} onClose={handleCloseImageDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Quản lý hình ảnh sản phẩm
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {selectedProductForImages && (
                            <>
                                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Sản phẩm
                                    </Typography>
                                    <Typography variant="h6" fontWeight="medium">
                                        {selectedProductForImages.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedProductForImages.description}
                                    </Typography>
                                </Box>
                                
                                {selectedProductForImages.operation_type === "PURCHASE" ? (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        Không thể tải ảnh cho sản phẩm loại &quot;Mua nguyên liệu&quot;
                                    </Alert>
                                ) : (
                                    <ImageUpload
                                        onUpload={handleImageUpload}
                                        onDelete={handleImageDelete}
                                        images={selectedProductForImages.images?.map(img => ({
                                            id: img.id,
                                            image_url: img.image_url
                                        })) || []}
                                        loading={imageOperationLoading}
                                    />
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseImageDialog} disabled={imageOperationLoading}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 