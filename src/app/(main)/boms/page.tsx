"use client";

import React, { useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import { bomApi, productApi } from "@/lib/products";
import { 
    BomComponent, 
    CreateProductBomRequest, 
    ProductBomResponse, 
    ProductResponse, 
    UpdateProductBomRequest 
} from "@/types";
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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

export default function BOMPage() {
    const [boms, setBoms] = useState<ProductBomResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBom, setEditingBom] = useState<ProductBomResponse | null>(null);
    const [expandedBoms, setExpandedBoms] = useState<Set<number>>(new Set());
    
    const [formData, setFormData] = useState<{
        parent_product_id: number;
        components: BomComponent[];
    }>({
        parent_product_id: 0,
        components: [],
    });

    // Load BOMs and products
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [bomsData, productsData] = await Promise.all([
                bomApi.getAll(),
                productApi.getAll() // Only load products with category IDs 7 and 8
            ]);
            
            setBoms(bomsData);
            setProducts(productsData);
        } catch (err: any) {
            console.error("Error loading data:", err);
            
            let errorMessage = "Không thể tải dữ liệu. Vui lòng thử lại.";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            if (formData.components.length === 0) {
                setError("Vui lòng thêm ít nhất một nguyên liệu.");
                return;
            }

            const dataToSubmit = {
                parent_product_id: formData.parent_product_id,
                components: formData.components,
            };

            if (editingBom) {
                // Update existing BOM
                const updateData: UpdateProductBomRequest = dataToSubmit;
                await bomApi.update(updateData);
            } else {
                // Create new BOM
                const createData: CreateProductBomRequest = dataToSubmit;
                await bomApi.create(createData);
            }
            
            // Reset form and reload data
            setOpenDialog(false);
            setEditingBom(null);
            resetForm();
            await loadData();
        } catch (err: any) {
            console.error("Error saving BOM:", err);
            
            let errorMessage = "Không thể lưu BOM. Vui lòng thử lại.";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (bom: ProductBomResponse) => {
        setEditingBom(bom);
        setFormData({
            parent_product_id: bom.parent_product_id,
            components: bom.components.map(comp => ({
                component_product_id: comp.component_product_id,
                quantity: comp.quantity,
            })),
        });
        setOpenDialog(true);
    };

    // Handle delete
    const handleDelete = async (parentProductId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa BOM này?")) {
            return;
        }

        try {
            setError(null);
            await bomApi.deleteByParentProductId(parentProductId);
            await loadData();
        } catch (err: any) {
            console.error("Error deleting BOM:", err);
            
            let errorMessage = "Không thể xóa BOM. Vui lòng thử lại.";
            
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            parent_product_id: 0,
            components: [],
        });
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingBom(null);
        resetForm();
        setError(null);
    };

    // Add new component
    const addComponent = () => {
        setFormData({
            ...formData,
            components: [...formData.components, { component_product_id: 0, quantity: 1 }],
        });
    };

    // Update component
    const updateComponent = (index: number, field: keyof BomComponent, value: number) => {
        const newComponents = [...formData.components];
        newComponents[index] = { ...newComponents[index], [field]: value };
        setFormData({ ...formData, components: newComponents });
    };

    // Remove component
    const removeComponent = (index: number) => {
        const newComponents = formData.components.filter((_, i) => i !== index);
        setFormData({ ...formData, components: newComponents });
    };

    // Toggle BOM expansion
    const toggleBomExpansion = (parentProductId: number) => {
        const newExpanded = new Set(expandedBoms);
        if (newExpanded.has(parentProductId)) {
            newExpanded.delete(parentProductId);
        } else {
            newExpanded.add(parentProductId);
        }
        setExpandedBoms(newExpanded);
    };

    // Get product by ID
    const getProductById = (id: number) => {
        return products.find(p => p.id === id);
    };

    // Format price to VND with decimal places
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }).format(price);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Quản lý BOM (Bill of Materials)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled
                    >
                        Thêm BOM
                    </Button>
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
                    Quản lý BOM (Bill of Materials)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Thêm BOM
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Expand</TableCell>
                                    <TableCell>Sản phẩm thành phẩm</TableCell>
                                    <TableCell>Số nguyên liệu</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {boms.map((bom) => {
                                    const parentProduct = bom.parent_product || getProductById(bom.parent_product_id);
                                    const isExpanded = expandedBoms.has(bom.parent_product_id);
                                    
                                    return (
                                        <React.Fragment key={`bom-${bom.parent_product_id}`}>
                                            <TableRow>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleBomExpansion(bom.parent_product_id)}
                                                    >
                                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {parentProduct?.name || `Product #${bom.parent_product_id}`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{bom.total_components}</TableCell>
                                                <TableCell>
                                                    <Tooltip title="Chỉnh sửa BOM">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleEdit(bom)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa BOM">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDelete(bom.parent_product_id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                            
                                            {/* Components details row */}
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 1 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Nguyên liệu cần thiết
                                                            </Typography>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell colSpan={2} />
                                                                        <TableCell>Nguyên liệu</TableCell>
                                                                        <TableCell>Số lượng</TableCell>
                                                                        <TableCell>Giá vốn</TableCell>
                                                                        <TableCell>Thành tiền</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {bom.components.map((component) => {
                                                                        const componentProduct = component.component_product;
                                                                        const totalCost = componentProduct ? component.quantity * componentProduct.cost : 0;
                                                                        
                                                                        return (
                                                                            <TableRow key={component.id}>
                                                                                <TableCell colSpan={2} />
                                                                                <TableCell>
                                                                                    {componentProduct?.name || `Product #${component.component_product_id}`}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {component.quantity}{componentProduct?.unit_name ? ` ${componentProduct.unit_name}` : ''}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {componentProduct ? formatPrice(componentProduct.cost) : "N/A"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {formatPrice(totalCost)}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingBom ? "Chỉnh sửa BOM" : "Thêm BOM mới"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Autocomplete
                            fullWidth
                            options={products.filter(p => 
                                // Exclude products that already have BOMs (unless editing current one)
                                editingBom?.parent_product_id === p.id || 
                                !boms.some(b => b.parent_product_id === p.id)
                            )}
                            getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={products.find(p => p.id === formData.parent_product_id) || null}
                            onChange={(_, newValue) => {
                                setFormData({ 
                                    ...formData, 
                                    parent_product_id: newValue?.id || 0 
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Sản phẩm thành phẩm"
                                    required
                                    disabled={submitting}
                                    margin="normal"
                                />
                            )}
                            disabled={submitting}
                        />

                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6">Nguyên liệu</Typography>
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addComponent}
                                    disabled={submitting}
                                >
                                    Thêm nguyên liệu
                                </Button>
                            </Box>
                        </Box>

                        {formData.components.map((component, index) => (
                            <Box key={`component-${index}`} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    options={products.filter(p => p.id !== formData.parent_product_id)}
                                    getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={products.find(p => p.id === component.component_product_id) || null}
                                    onChange={(_, newValue) => {
                                        updateComponent(index, "component_product_id", newValue?.id || 0);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Nguyên liệu"
                                            required
                                            disabled={submitting}
                                        />
                                    )}
                                    disabled={submitting}
                                />
                                <TextField
                                    label="Số lượng"
                                    type="number"
                                    value={component.quantity}
                                    onChange={(e) => {
                                        updateComponent(index, "quantity", Number(e.target.value));
                                    }}
                                    required
                                    disabled={submitting}
                                    inputProps={{ min: 0.01, step: 0.01 }}
                                    sx={{ width: 120 }}
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => removeComponent(index)}
                                    disabled={submitting}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}

                        {formData.components.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                Chưa có nguyên liệu nào. Nhấn &ldquo;Thêm nguyên liệu&rdquo; để bắt đầu.
                            </Typography>
                        )}
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
                        disabled={!formData.parent_product_id || formData.components.length === 0}
                    >
                        {editingBom ? "Cập nhật" : "Thêm"}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 