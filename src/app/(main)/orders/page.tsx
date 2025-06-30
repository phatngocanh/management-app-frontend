"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import { customerApi } from "@/lib/customers";
import { OrderFilters,ordersApi } from "@/lib/orders";
import { CustomerResponse, OrderResponse } from "@/types";
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterIcon } from "@mui/icons-material";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
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
    Typography,
} from "@mui/material";

const DELIVERY_STATUSES = [
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "DELIVERED", label: "Đã giao hàng" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "UNPAID", label: "Chưa thanh toán" },
];

const SORT_OPTIONS = [
    { value: "", label: "Mặc định (ID giảm dần)" },
    { value: "order_date_desc", label: "Ngày đặt (mới nhất)" },
    { value: "order_date_asc", label: "Ngày đặt (cũ nhất)" },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<OrderResponse | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    // Filter states
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedSort, setSelectedSort] = useState<string>('');

    useEffect(() => {
        loadCustomers();
        loadOrders();
    }, []);

    const loadCustomers = async () => {
        try {
            const customersData = await customerApi.getAll();
            setCustomers(customersData);
        } catch (err) {
            console.error("Error loading customers:", err);
        }
    };

    const loadOrders = async (filters?: OrderFilters) => {
        try {
            setLoading(true);
            const response = await ordersApi.getAll(filters);
            setOrders(response.orders);
        } catch (err) {
            setError("Không thể tải danh sách đơn hàng");
            console.error("Error loading orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSelectedCustomerId('');
        setSelectedStatuses([]);
        setSelectedSort('');
        loadOrders();
    };

    const handleStatusChange = (status: string) => {
        const newStatuses = selectedStatuses.includes(status) 
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        setSelectedStatuses(newStatuses);
        
        // Apply filters immediately
        const filters: OrderFilters = {};
        if (selectedCustomerId !== '') {
            filters.customer_id = selectedCustomerId as number;
        }
        if (newStatuses.length > 0) {
            filters.delivery_statuses = newStatuses.join(',');
        }
        if (selectedSort !== '') {
            filters.sort_by = selectedSort;
        }
        loadOrders(filters);
    };

    const handleSortChange = (sortBy: string) => {
        setSelectedSort(sortBy);
        
        // Apply filters with new sort
        const filters: OrderFilters = {};
        if (selectedCustomerId !== '') {
            filters.customer_id = selectedCustomerId as number;
        }
        if (selectedStatuses.length > 0) {
            filters.delivery_statuses = selectedStatuses.join(',');
        }
        if (sortBy !== '') {
            filters.sort_by = sortBy;
        }
        loadOrders(filters);
    };

    const handleDeleteClick = (order: OrderResponse) => {
        setOrderToDelete(order);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!orderToDelete) return;

        try {
            setDeleting(true);
            await ordersApi.delete(orderToDelete.id);
            
            // Remove the deleted order from the list
            setOrders(orders.filter(order => order.id !== orderToDelete.id));
            
            // Close dialog and reset state
            setDeleteDialogOpen(false);
            setOrderToDelete(null);
        } catch (err) {
            setError("Không thể xóa đơn hàng");
            console.error("Error deleting order:", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
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

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Quản lý Đơn hàng
                    </Typography>
                    <Button
                        component={Link}
                        href="/orders/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled
                    >
                        Tạo đơn hàng mới
                    </Button>
                </Box>
                <Paper>
                    <SkeletonLoader type="table" rows={8} columns={8} />
                </Paper>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => loadOrders()} sx={{ mt: 2 }}>
                    Thử lại
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Quản lý Đơn hàng
                </Typography>
                <Button
                    component={Link}
                    href="/orders/create"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    Tạo đơn hàng mới
                </Button>
            </Box>

            {/* Filter Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
                        <FilterIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        Bộ lọc
                    </Typography>
                </Box>
                
                <Collapse in={filtersOpen}>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Khách hàng</InputLabel>
                            <Select
                                value={selectedCustomerId}
                                label="Khách hàng"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const newCustomerId = value === '' ? '' : Number(value);
                                    setSelectedCustomerId(newCustomerId);
                                    
                                    // Apply filters immediately
                                    const filters: OrderFilters = {};
                                    if (newCustomerId !== '') {
                                        filters.customer_id = newCustomerId as number;
                                    }
                                    if (selectedStatuses.length > 0) {
                                        filters.delivery_statuses = selectedStatuses.join(',');
                                    }
                                    if (selectedSort !== '') {
                                        filters.sort_by = selectedSort;
                                    }
                                    loadOrders(filters);
                                }}
                            >
                                <MenuItem value="">
                                    <em>Tất cả khách hàng</em>
                                </MenuItem>
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl component="fieldset">
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Trạng thái giao hàng
                            </Typography>
                            <FormGroup row>
                                {DELIVERY_STATUSES.map((status) => (
                                    <FormControlLabel
                                        key={status.value}
                                        control={
                                            <Checkbox
                                                checked={selectedStatuses.includes(status.value)}
                                                onChange={() => handleStatusChange(status.value)}
                                            />
                                        }
                                        label={status.label}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>

                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select
                                value={selectedSort}
                                label="Sắp xếp"
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.value === '' ? <em>{option.label}</em> : option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={handleClearFilters}
                                size="small"
                                sx={{ mt: 'auto', mb: 'auto' }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Ngày đặt</TableCell>
                            <TableCell>Trạng thái giao hàng</TableCell>
                            <TableCell>Trạng thái công nợ</TableCell>
                            <TableCell>Số lượng sản phẩm</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Lãi/Lỗ</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Typography variant="body2" color="textSecondary">
                                        Chưa có đơn hàng nào
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customer.name}</TableCell>
                                    <TableCell>{formatDate(order.order_date)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(order.delivery_status)}
                                            color={getStatusColor(order.delivery_status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {getStatusLabel(order.debt_status)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{order.product_count || 0}</TableCell>
                                    <TableCell>
                                        {order.total_amount
                                            ? `${order.total_amount.toLocaleString("vi-VN")} VNĐ`
                                            : "0 VNĐ"}
                                    </TableCell>
                                    <TableCell>
                                        {order.total_profit_loss !== undefined && (
                                            <Typography
                                                variant="body2"
                                                color={order.total_profit_loss >= 0 ? "success.main" : "error.main"}
                                            >
                                                {order.total_profit_loss >= 0 ? "+" : ""}
                                                {order.total_profit_loss.toLocaleString("vi-VN")} VNĐ
                                                {order.total_profit_loss_percentage !== undefined && (
                                                    <span>
                                                        {" "}
                                                        ({order.total_profit_loss_percentage >= 0 ? "+" : ""}
                                                        {order.total_profit_loss_percentage.toFixed(1)}%)
                                                    </span>
                                                )}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            component={Link}
                                            href={`/orders/${order.id}`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            Xem
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(order)}
                                        >
                                            Xóa
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa đơn hàng #{orderToDelete?.id} của khách hàng{" "}
                        {orderToDelete?.customer.name}? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deleting}>
                        Hủy
                    </Button>
                    <LoadingButton
                        onClick={handleDeleteConfirm}
                        loading={deleting}
                        color="error"
                        variant="contained"
                    >
                        Xóa
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 