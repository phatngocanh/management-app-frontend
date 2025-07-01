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
    Close as CloseIcon,
    Delete as DeleteIcon, 
    Edit as EditIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    PhotoCamera as PhotoCameraIcon,
    Visibility as VisibilityIcon
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
    
    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{ url: string; alt: string }[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
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
                productApi.getAll(undefined, undefined, true) // noBom: true for better performance
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

    // Image modal functions
    const openImageModal = (images: { url: string; alt: string }[], startIndex: number = 0) => {
        setSelectedImages(images);
        setCurrentImageIndex(startIndex);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setSelectedImages([]);
        setCurrentImageIndex(0);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedImages.length <= 1) return;
        
        if (direction === 'prev') {
            setCurrentImageIndex(prev => prev === 0 ? selectedImages.length - 1 : prev - 1);
        } else {
            setCurrentImageIndex(prev => prev === selectedImages.length - 1 ? 0 : prev + 1);
        }
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
                                    <TableCell>Hình ảnh</TableCell>
                                    <TableCell>Sản phẩm thành phẩm</TableCell>
                                    <TableCell>Số nguyên liệu</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {boms
                                    .sort((a, b) => {
                                        const productA = getProductById(a.parent_product_id);
                                        const productB = getProductById(b.parent_product_id);
                                        const nameA = productA?.name || `Product #${a.parent_product_id}`;
                                        const nameB = productB?.name || `Product #${b.parent_product_id}`;
                                        return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
                                    })
                                    .map((bom) => {
                                    const parentProduct = getProductById(bom.parent_product_id);
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
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {parentProduct?.images && parentProduct.images.length > 0 ? (
                                                            <Box
                                                                sx={{
                                                                    position: 'relative',
                                                                    cursor: 'pointer',
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden',
                                                                    '&:hover .image-overlay': {
                                                                        opacity: 1
                                                                    }
                                                                }}
                                                                onClick={() => openImageModal(
                                                                    parentProduct.images!.map(img => ({
                                                                        url: img.image_url,
                                                                        alt: parentProduct.name || 'Product image'
                                                                    }))
                                                                )}
                                                            >
                                                                <Box
                                                                    component="img"
                                                                    src={parentProduct.images[0].image_url}
                                                                    alt={parentProduct.name}
                                                                    sx={{
                                                                        width: 60,
                                                                        height: 60,
                                                                        objectFit: 'cover',
                                                                        border: '1px solid #ddd',
                                                                        display: 'block'
                                                                    }}
                                                                />
                                                                <Box
                                                                    className="image-overlay"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        bottom: 0,
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        opacity: 0,
                                                                        transition: 'opacity 0.2s ease-in-out'
                                                                    }}
                                                                >
                                                                    <VisibilityIcon sx={{ color: 'white', fontSize: 24 }} />
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            <Box
                                                                sx={{
                                                                    width: 60,
                                                                    height: 60,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: 1,
                                                                    border: '1px solid #ddd'
                                                                }}
                                                            >
                                                                <PhotoCameraIcon sx={{ color: '#999', fontSize: 24 }} />
                                                            </Box>
                                                        )}
                                                        {parentProduct?.images && parentProduct.images.length > 1 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                +{parentProduct.images.length - 1}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {parentProduct?.name || `Product #${bom.parent_product_id}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {parentProduct?.operation_type}
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
                                                                        <TableCell>Hình ảnh</TableCell>
                                                                        <TableCell>Nguyên liệu</TableCell>
                                                                        <TableCell>Số lượng</TableCell>
                                                                        <TableCell>Giá vốn</TableCell>
                                                                        <TableCell>Thành tiền</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {bom.components.map((component) => {
                                                                        const componentProduct = component.component_product;
                                                                        const fullComponentProduct = getProductById(component.component_product_id);
                                                                        const totalCost = componentProduct ? component.quantity * componentProduct.cost : 0;
                                                                        
                                                                        return (
                                                                            <TableRow key={component.id}>
                                                                                <TableCell colSpan={2} />
                                                                                <TableCell>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        {fullComponentProduct?.images && fullComponentProduct.images.length > 0 ? (
                                                                                            <Box
                                                                                                sx={{
                                                                                                    position: 'relative',
                                                                                                    cursor: 'pointer',
                                                                                                    borderRadius: 1,
                                                                                                    overflow: 'hidden',
                                                                                                    '&:hover .image-overlay': {
                                                                                                        opacity: 1
                                                                                                    }
                                                                                                }}
                                                                                                onClick={() => openImageModal(
                                                                                                    fullComponentProduct.images!.map(img => ({
                                                                                                        url: img.image_url,
                                                                                                        alt: componentProduct?.name || 'Component image'
                                                                                                    }))
                                                                                                )}
                                                                                            >
                                                                                                <Box
                                                                                                    component="img"
                                                                                                    src={fullComponentProduct.images[0].image_url}
                                                                                                    alt={componentProduct?.name || 'Component'}
                                                                                                    sx={{
                                                                                                        width: 40,
                                                                                                        height: 40,
                                                                                                        objectFit: 'cover',
                                                                                                        border: '1px solid #ddd',
                                                                                                        display: 'block'
                                                                                                    }}
                                                                                                />
                                                                                                <Box
                                                                                                    className="image-overlay"
                                                                                                    sx={{
                                                                                                        position: 'absolute',
                                                                                                        top: 0,
                                                                                                        left: 0,
                                                                                                        right: 0,
                                                                                                        bottom: 0,
                                                                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        justifyContent: 'center',
                                                                                                        opacity: 0,
                                                                                                        transition: 'opacity 0.2s ease-in-out'
                                                                                                    }}
                                                                                                >
                                                                                                    <VisibilityIcon sx={{ color: 'white', fontSize: 16 }} />
                                                                                                </Box>
                                                                                            </Box>
                                                                                        ) : (
                                                                                            <Box
                                                                                                sx={{
                                                                                                    width: 40,
                                                                                                    height: 40,
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    justifyContent: 'center',
                                                                                                    backgroundColor: '#f5f5f5',
                                                                                                    borderRadius: 1,
                                                                                                    border: '1px solid #ddd'
                                                                                                }}
                                                                                            >
                                                                                                <PhotoCameraIcon sx={{ color: '#999', fontSize: 16 }} />
                                                                                            </Box>
                                                                                        )}
                                                                                        {fullComponentProduct?.images && fullComponentProduct.images.length > 1 && (
                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                +{fullComponentProduct.images.length - 1}
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Box>
                                                                                        <Typography variant="body2">
                                                                                            {componentProduct?.name || `Product #${component.component_product_id}`}
                                                                                        </Typography>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            {fullComponentProduct?.operation_type}
                                                                                        </Typography>
                                                                                    </Box>
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
                                // Exclude PURCHASE products (they can't have BOMs)
                                p.operation_type !== "PURCHASE" &&
                                // Exclude products that already have BOMs (unless editing current one)
                                (editingBom?.parent_product_id === p.id || 
                                !boms.some(b => b.parent_product_id === p.id))
                            )}
                            getOptionLabel={(option) => `${option.name} (${option.operation_type}) (ID: ${option.id})`}
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
                                    label="Sản phẩm thành phẩm (Chỉ MANUFACTURING/PACKAGING)"
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

                        {formData.components.map((component, index) => {
                            const selectedProduct = products.find(p => p.id === component.component_product_id);
                            const unitName = selectedProduct?.unit?.name || selectedProduct?.unit?.code;
                            
                            return (
                                <Box key={`component-${index}`} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                                    <Autocomplete
                                        sx={{ flex: 1 }}
                                        options={products.filter(p => p.id !== formData.parent_product_id)}
                                        getOptionLabel={(option) => `${option.name} (${option.operation_type}) (ID: ${option.id})`}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        value={selectedProduct || null}
                                        onChange={(_, newValue) => {
                                            updateComponent(index, "component_product_id", newValue?.id || 0);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Nguyên liệu (Tất cả loại sản phẩm)"
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
                                        helperText={unitName ? `Đơn vị: ${unitName}` : ''}
                                    />
                                    <IconButton
                                        color="error"
                                        onClick={() => removeComponent(index)}
                                        disabled={submitting}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            );
                        })}

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

            {/* Image Modal */}
            <Dialog
                open={imageModalOpen}
                onClose={closeImageModal}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        boxShadow: 'none',
                    },
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: 'transparent' }}>
                    {selectedImages.length > 0 && (
                        <>
                            {/* Close button */}
                            <IconButton
                                onClick={closeImageModal}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 1,
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    },
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                            {/* Navigation buttons */}
                            {selectedImages.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={() => navigateImage('prev')}
                                        sx={{
                                            position: 'absolute',
                                            left: 16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1,
                                            color: 'white',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => navigateImage('next')}
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1,
                                            color: 'white',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </>
                            )}

                            {/* Image */}
                            <Box
                                component="img"
                                src={selectedImages[currentImageIndex]?.url}
                                alt={selectedImages[currentImageIndex]?.alt}
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                    display: 'block',
                                }}
                            />

                            {/* Image counter */}
                            {selectedImages.length > 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2">
                                        {currentImageIndex + 1} / {selectedImages.length}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
} 