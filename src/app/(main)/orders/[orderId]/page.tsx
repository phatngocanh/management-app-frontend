"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import ImageUpload from "@/components/ImageUpload";
import { orderImagesApi } from "@/lib/order-images";
import { ordersApi } from "@/lib/orders";
import { OrderResponse, UpdateOrderRequest } from "@/types";
import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = parseInt(params.orderId as string);

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editType, setEditType] = useState<'delivery' | 'debt' | 'additional_cost' | 'additional_cost_note'>('delivery');
    const [editStatus, setEditStatus] = useState('');
    const [editAdditionalCost, setEditAdditionalCost] = useState('');
    const [editAdditionalCostNote, setEditAdditionalCostNote] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Image states
    const [uploadingImage, setUploadingImage] = useState(false);

    const loadOrder = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ordersApi.getOne(orderId);
            setOrder(response.order);
        } catch (err) {
            setError("Không thể tải thông tin đơn hàng");
            console.error("Error loading order:", err);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId, loadOrder]);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!order) return;

        try {
            setDeleting(true);
            await ordersApi.delete(order.id);
            
            // Redirect to orders list after successful deletion
            router.push("/orders");
        } catch (err) {
            setError("Không thể xóa đơn hàng");
            console.error("Error deleting order:", err);
            setDeleteDialogOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const formatDateOnly = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "DELIVERED":
                return "success";
            case "UNPAID":
                return "info";
            case "COMPLETED":
                return "primary";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "DELIVERED":
                return "Đã giao hàng";
            case "UNPAID":
                return "Chưa thanh toán";
            case "COMPLETED":
                return "Hoàn thành";
            default:
                return status;
        }
    };

    const getExportFromLabel = (exportFrom: string) => {
        switch (exportFrom) {
            case "INVENTORY":
                return "Từ kho";
            case "EXTERNAL":
                return "Từ bên ngoài";
            default:
                return exportFrom;
        }
    };

    const getExportFromColor = (exportFrom: string) => {
        switch (exportFrom) {
            case "INVENTORY":
                return "success";
            case "EXTERNAL":
                return "warning";
            default:
                return "default";
        }
    };

    const handleEditStatus = (type: 'delivery' | 'debt' | 'additional_cost' | 'additional_cost_note') => {
        setEditType(type);
        if (type === 'delivery') {
            setEditStatus(order?.delivery_status || '');
        } else if (type === 'debt') {
            setEditStatus(order?.debt_status || '');
        } else if (type === 'additional_cost') {
            setEditAdditionalCost((order?.additional_cost || 0).toString());
        } else if (type === 'additional_cost_note') {
            setEditAdditionalCostNote(order?.additional_cost_note || '');
        }
        setEditDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!order) return;

        try {
            setUpdating(true);
            setError(null);
            setSuccess(null);
            
            const updateData: UpdateOrderRequest = {
                id: order.id,
            };

            if (editType === 'delivery') {
                if (!editStatus) return;
                updateData.delivery_status = editStatus;
            } else if (editType === 'debt') {
                updateData.debt_status = editStatus;
            } else if (editType === 'additional_cost') {
                updateData.additional_cost = parseInt(editAdditionalCost) || 0;
            } else if (editType === 'additional_cost_note') {
                updateData.additional_cost_note = editAdditionalCostNote;
            }

            await ordersApi.update(order.id, updateData);
            
            // Reload order to get updated data
            await loadOrder();
            
            setEditDialogOpen(false);
            setEditStatus('');
            setEditAdditionalCost('');
            setEditAdditionalCostNote('');
            setSuccess("Thông tin đơn hàng đã được cập nhật thành công");
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError("Không thể cập nhật thông tin đơn hàng");
            console.error("Error updating order:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploadingImage(true);
            setError(null);
            await orderImagesApi.uploadImage(orderId, file);
            await loadOrder(); // Reload order after upload
            setSuccess("Ảnh đã được tải lên thành công");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Không thể tải ảnh lên");
            console.error("Error uploading image:", err);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageDelete = async (imageId: number) => {
        try {
            await orderImagesApi.deleteImage(orderId, imageId);
            await loadOrder(); // Reload order after deletion
            setSuccess("Ảnh đã được xóa thành công");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Không thể xóa ảnh");
            console.error("Error deleting image:", err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Đang tải...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={loadOrder} sx={{ mt: 2 }}>
                    Thử lại
                </Button>
            </Box>
        );
    }

    if (!order) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Không tìm thấy đơn hàng</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push("/orders")}
                        sx={{ mr: 2 }}
                    >
                        Quay lại
                    </Button>
                    <Typography variant="h4" component="h1">
                        Chi tiết đơn hàng #{order.id}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                >
                    Xóa đơn hàng
                </Button>
            </Box>

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

            <Grid container spacing={3}>
                {/* Order Information */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thông tin đơn hàng
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        ID đơn hàng:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        ID khách hàng:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.customer.id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Ngày đặt hàng:
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDateOnly(order.order_date)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Trạng thái giao hàng:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={getStatusLabel(order.delivery_status)}
                                            color={getStatusColor(order.delivery_status) as any}
                                            size="small"
                                        />
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditStatus('delivery')}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            Sửa
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Trạng thái công nợ:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                            {order.debt_status}
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditStatus('debt')}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            Sửa
                                        </Button>
                                    </Box>
                                </Grid>
                                {order.status_transitioned_at && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Thời gian chuyển trạng thái:
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDateTime(order.status_transitioned_at)}
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Chi phí phụ thêm:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                            {(order.additional_cost || 0).toLocaleString("vi-VN")} VND
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditStatus('additional_cost')}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            Sửa
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Ghi chú chi phí phụ thêm:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                            {order.additional_cost_note || "Không có ghi chú"}
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditStatus('additional_cost_note')}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            Sửa
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thông tin khách hàng
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        ID:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.customer.id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Tên:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.customer.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Số điện thoại:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.customer.phone}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Địa chỉ:
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.customer.address}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Tổng quan
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Số lượng sản phẩm:
                                    </Typography>
                                    <Typography variant="h6">
                                        {order.product_count ?? order.order_items.length}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Tổng tiền:
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {(order.total_amount ?? 0).toLocaleString("vi-VN")} VND
                                    </Typography>
                                </Grid>
                                {order.total_profit_loss !== undefined && order.total_profit_loss_percentage !== undefined && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="textSecondary">
                                            Tổng lãi/lỗ:
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: order.total_profit_loss >= 0 ? '#059669' : '#dc2626',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {order.total_profit_loss >= 0 ? '+' : ''}{order.total_profit_loss.toLocaleString("vi-VN")} VND ({order.total_profit_loss_percentage >= 0 ? '+' : ''}{order.total_profit_loss_percentage.toFixed(1)}%)
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Items */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Sản phẩm trong đơn hàng
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Sản phẩm</TableCell>
                                            
                                            <TableCell>Số lượng</TableCell>
                                            <TableCell>Giá bán</TableCell>
                                            <TableCell>Chiết khấu</TableCell>
                                            <TableCell>Thành tiền</TableCell>
                                            <TableCell>Lãi/Lỗ</TableCell>
                                            <TableCell>Nguồn xuất</TableCell>
                                            <TableCell><b>Tổng cộng</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.order_items.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <TableRow>
                                                    <TableCell sx={{ borderBottom: 'none' }}>{item.id}</TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>{item.product_name || item.product_id}</TableCell>
                                                    
                    
                                                    <TableCell sx={{ borderBottom: 'none' }}>{item.quantity}</TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>{item.selling_price.toLocaleString("vi-VN")} VND</TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>{item.discount}%</TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>{(item.final_amount ?? 0).toLocaleString("vi-VN")} VND</TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>
                                                        {item.profit_loss !== undefined && item.profit_loss_percentage !== undefined && (
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: item.profit_loss >= 0 ? '#059669' : '#dc2626',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    {item.profit_loss >= 0 ? '+' : ''}{item.profit_loss.toLocaleString("vi-VN")} VND
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: item.profit_loss_percentage >= 0 ? '#059669' : '#dc2626'
                                                                    }}
                                                                >
                                                                    ({item.profit_loss_percentage >= 0 ? '+' : ''}{item.profit_loss_percentage.toFixed(1)}%)
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }}>
                                                        <Chip
                                                            label={getExportFromLabel(item.export_from)}
                                                            color={getExportFromColor(item.export_from) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: 'none' }} />
                                                </TableRow>
                                                {item.original_price !== undefined && item.profit_loss !== undefined && item.profit_loss_percentage !== undefined && (
                                                    <TableRow>
                                                        <TableCell colSpan={11} sx={{ p: 0.5, border: 0, borderBottom: '1px solid #e0e0e0' }}>
                                                            <span
                                                                style={{
                                                                    fontSize: 13,
                                                                    color: item.profit_loss >= 0 ? '#059669' : '#dc2626',
                                                                    fontStyle: 'italic',
                                                                    marginLeft: 24,
                                                                    display: 'block',
                                                                    opacity: 0.85,
                                                                }}
                                                            >
                                                                Giá vốn {item.original_price.toLocaleString('vi-VN')}đ × {item.quantity} = {(item.original_price * item.quantity).toLocaleString('vi-VN')}, bán {item.selling_price.toLocaleString('vi-VN')}đ × {item.quantity} = {(item.selling_price * item.quantity).toLocaleString('vi-VN')}
                                                                {item.discount > 0 ? `, chiết khấu ${item.discount}% (${((item.selling_price * item.quantity * item.discount) / 100).toLocaleString('vi-VN')}đ) = còn ${(item.final_amount || 0).toLocaleString('vi-VN')}` : ''}
                                                                → {item.profit_loss >= 0 ? 'Lãi' : 'Lỗ'} {Math.abs(item.profit_loss).toLocaleString('vi-VN')}đ ({item.profit_loss_percentage >= 0 ? '+' : ''}{item.profit_loss_percentage.toFixed(1)}%)
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {/* Summary Row */}
                                        {order && (
                                            <TableRow>
                                                <TableCell colSpan={6} />
                                                <TableCell sx={{ fontWeight: 'bold', color: '#2563eb' }}>Tổng cộng</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                                                    {(() => {
                                                        const totalAmount = (order.total_amount ?? 0) - (order.additional_cost ?? 0);
                                                        return `${totalAmount.toLocaleString('vi-VN')} VND`;
                                                    })()}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: (() => {
                                                    const totalProfitLoss = ((order.total_profit_loss ?? 0) - (order.additional_cost ?? 0));
                                                    return totalProfitLoss >= 0 ? '#059669' : '#dc2626';
                                                })() }}>
                                                    {(() => {
                                                        const totalProfitLoss = ((order.total_profit_loss ?? 0) - (order.additional_cost ?? 0));
                                                        return totalProfitLoss >= 0 ? `+${totalProfitLoss.toLocaleString('vi-VN')}` : `${totalProfitLoss.toLocaleString('vi-VN')}`;
                                                    })()} VND
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Images */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Ảnh đơn hàng
                            </Typography>
                            <ImageUpload
                                onUpload={handleImageUpload}
                                onDelete={handleImageDelete}
                                images={order.images || []}
                                disabled={uploadingImage}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Status Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Cập nhật {editType === 'delivery' ? 'trạng thái giao hàng' : editType === 'debt' ? 'trạng thái công nợ' : editType === 'additional_cost' ? 'chi phí phụ thêm' : 'ghi chú chi phí phụ thêm'}
                </DialogTitle>
                <DialogContent>
                    {editType === 'delivery' ? (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Trạng thái giao hàng</InputLabel>
                            <Select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                label="Trạng thái giao hàng"
                            >
                                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                                <MenuItem value="DELIVERED">Đã giao hàng</MenuItem>
                                <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
                                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                            </Select>
                        </FormControl>
                    ) : editType === 'debt' ? (
                        <TextField
                            fullWidth
                            sx={{ mt: 2 }}
                            label="Trạng thái công nợ"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                        />
                    ) : editType === 'additional_cost' ? (
                        <TextField
                            fullWidth
                            sx={{ mt: 2 }}
                            label="Chi phí phụ thêm (VND)"
                            type="text"
                            value={editAdditionalCost ? parseInt(editAdditionalCost).toLocaleString("vi-VN") : "0"}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d-]/g, "");
                                // Handle negative numbers properly
                                if (raw === "-") {
                                    setEditAdditionalCost("0");
                                } else if (raw.startsWith("-")) {
                                    const numValue = parseInt(raw);
                                    setEditAdditionalCost(isNaN(numValue) ? "0" : raw);
                                } else {
                                    setEditAdditionalCost(raw ? raw : "0");
                                }
                            }}
                            placeholder="0"
                        />
                    ) : (
                        <TextField
                            fullWidth
                            sx={{ mt: 2 }}
                            label="Ghi chú chi phí phụ thêm"
                            value={editAdditionalCostNote}
                            onChange={(e) => setEditAdditionalCostNote(e.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={updating}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleUpdateStatus} 
                        variant="contained" 
                        disabled={
                            updating || 
                            (editType === 'delivery' && !editStatus) ||
                            (editType === 'additional_cost' && !editAdditionalCost)
                        }
                    >
                        {updating ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Xác nhận xóa đơn hàng"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa đơn hàng số {order.id} của khách hàng {order.customer.name}?
                        <br />
                        <br />
                        <strong>Lưu ý:</strong> Nếu đơn hàng này có sản phẩm được xuất từ kho, chúng sẽ được hoàn lại vào kho.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deleting}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? "Đang xóa..." : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 