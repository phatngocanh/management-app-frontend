"use client";

import { useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import { customerApi } from "@/lib/customers";
import { CustomerResponse, UpdateCustomerRequest } from "@/types";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
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

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        phone: string;
        address: string;
    }>({
        name: "",
        phone: "",
        address: "",
    });

    // Load customers
    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await customerApi.getAll();
            setCustomers(data);
        } catch (err: any) {
            console.error("Error loading customers:", err);
            
            // Extract error message from backend response
            let errorMessage = "Không thể tải danh sách khách hàng. Vui lòng thử lại.";
            
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
        loadCustomers();
    }, []);

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            const dataToSubmit = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
            };

            if (editingCustomer) {
                // Update existing customer - only send non-empty fields
                const updateData: UpdateCustomerRequest = {};
                if (dataToSubmit.name) updateData.name = dataToSubmit.name;
                if (dataToSubmit.phone) updateData.phone = dataToSubmit.phone;
                if (dataToSubmit.address) updateData.address = dataToSubmit.address;
                
                await customerApi.update(editingCustomer.id, updateData);
            } else {
                // Create new customer
                await customerApi.create(dataToSubmit);
            }
            
            // Reset form and reload customers
            setOpenDialog(false);
            setEditingCustomer(null);
            setFormData({ name: "", phone: "", address: "" });
            await loadCustomers();
        } catch (err: any) {
            console.error("Error saving customer:", err);
            
            // Extract error message from backend response
            let errorMessage = "Không thể lưu khách hàng. Vui lòng thử lại.";
            
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
    const handleEdit = (customer: CustomerResponse) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
        });
        setOpenDialog(true);
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCustomer(null);
        setFormData({ name: "", phone: "", address: "" });
        setError(null);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Quản lý Khách hàng
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled
                    >
                        Thêm Khách hàng
                    </Button>
                </Box>
                <Card>
                    <CardContent>
                        <SkeletonLoader type="table" rows={8} columns={5} />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Quản lý Khách hàng
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Thêm Khách hàng
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
                                    <TableCell>Mã KH</TableCell>
                                    <TableCell>Tên khách hàng</TableCell>
                                    <TableCell>Số điện thoại</TableCell>
                                    <TableCell>Địa chỉ</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.code}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>{customer.address}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(customer)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                Chưa có khách hàng nào
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCustomer ? "Chỉnh sửa Khách hàng" : "Thêm Khách hàng mới"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên khách hàng"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required={!editingCustomer}
                            disabled={submitting}
                        />
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            margin="normal"
                            required={!editingCustomer}
                            disabled={submitting}
                        />
                        <TextField
                            fullWidth
                            label="Địa chỉ"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                            required={!editingCustomer}
                            disabled={submitting}
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
                        disabled={!formData.name || !formData.phone}
                    >
                        {editingCustomer ? "Cập nhật" : "Thêm"}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 