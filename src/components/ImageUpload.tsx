"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";

import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";

interface ImageUploadProps {
    onUpload: (file: File) => Promise<void>;
    onDelete?: (imageId: number) => Promise<void>;
    images?: Array<{
        id: number;
        image_url: string;
    }>;
    disabled?: boolean;
    loading?: boolean;
}

export default function ImageUpload({
    onUpload,
    onDelete,
    images = [],
    disabled = false,
    loading = false,
}: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleFileUpload = useCallback(async (file: File) => {
        try {
            setUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    }, [onUpload]);

    const handleDrag = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
                setDragActive(true);
            } else if (e.type === "dragleave") {
                setDragActive(false);
            }
        },
        []
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("image/")) {
                    await handleFileUpload(file);
                }
            }
        },
        [handleFileUpload]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                await handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    const handleDeleteImage = async (imageId: number) => {
        if (!onDelete) return;

        try {
            setDeletingImageId(imageId);
            await onDelete(imageId);
        } catch (error) {
            console.error("Error deleting image:", error);
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setViewerOpen(true);
    };

    const handleCloseViewer = useCallback(() => {
        setViewerOpen(false);
    }, []);

    const handlePreviousImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!viewerOpen) return;
        
        switch (e.key) {
            case 'Escape':
                handleCloseViewer();
                break;
            case 'ArrowLeft':
                handlePreviousImage();
                break;
            case 'ArrowRight':
                handleNextImage();
                break;
        }
    }, [viewerOpen, handleCloseViewer, handlePreviousImage, handleNextImage]);

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <Box>
            {/* Upload Area */}
            <Card
                variant="outlined"
                sx={{
                    border: dragActive ? "2px dashed #1976d2" : "1px solid #e0e0e0",
                    backgroundColor: dragActive ? "#f5f5f5" : "transparent",
                    transition: "all 0.2s ease",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            py: 3,
                        }}
                    >
                        {uploading || loading ? (
                            <CircularProgress size={40} />
                        ) : (
                            <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                        )}
                        <Typography variant="h6" gutterBottom>
                            {dragActive ? "Thả ảnh vào đây" : "Tải ảnh lên"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                            Kéo và thả ảnh vào đây hoặc nhấn để chọn file
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                            id="image-upload-input"
                            disabled={disabled || uploading || loading}
                        />
                        <label htmlFor="image-upload-input">
                            <Button
                                variant="contained"
                                component="span"
                                disabled={disabled || uploading || loading}
                                startIcon={<ImageIcon />}
                            >
                                Chọn ảnh
                            </Button>
                        </label>
                    </Box>
                </CardContent>
            </Card>

            {/* Image Gallery */}
            {images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Ảnh đã tải ({images.length})
                    </Typography>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: 2,
                        }}
                    >
                        {images.map((image, index) => (
                            <Card key={image.id} variant="outlined">
                                <Box sx={{ position: "relative" }}>
                                    <Button
                                        onClick={() => handleImageClick(index)}
                                        sx={{
                                            p: 0,
                                            width: "100%",
                                            height: "200px",
                                            minWidth: "unset",
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                            },
                                        }}
                                        aria-label={`Xem ảnh ${index + 1}`}
                                    >
                                        <Image
                                            src={image.image_url}
                                            alt={`Ảnh đơn hàng ${image.id}`}
                                            width={200}
                                            height={200}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                backgroundColor: "#f5f5f5",
                                            }}
                                        />
                                    </Button>
                                    {onDelete && (
                                        <IconButton
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteImage(image.id);
                                            }}
                                            disabled={deletingImageId === image.id}
                                            size="small"
                                            aria-label="Xóa ảnh"
                                        >
                                            {deletingImageId === image.id ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <DeleteIcon />
                                            )}
                                        </IconButton>
                                    )}
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Image Viewer Modal */}
            <Dialog
                open={viewerOpen}
                onClose={handleCloseViewer}
                maxWidth={false}
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        boxShadow: "none",
                        maxHeight: "95vh",
                        margin: "2.5vh auto",
                    },
                }}
            >
                <DialogContent sx={{ p: 0, position: "relative", height: "90vh", overflow: "hidden" }}>
                    {/* Close Button */}
                    <IconButton
                        onClick={handleCloseViewer}
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 1,
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                        }}
                        aria-label="Đóng xem ảnh"
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePreviousImage}
                                sx={{
                                    position: "absolute",
                                    left: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    zIndex: 1,
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                                aria-label="Ảnh trước"
                            >
                                <NavigateBeforeIcon />
                            </IconButton>
                            <IconButton
                                onClick={handleNextImage}
                                sx={{
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    zIndex: 1,
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                                aria-label="Ảnh tiếp"
                            >
                                <NavigateNextIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Image Display */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            p: 2,
                            boxSizing: "border-box",
                        }}
                    >
                        {images[currentImageIndex] && (
                            <Image
                                src={images[currentImageIndex].image_url}
                                alt={`Ảnh đơn hàng ${images[currentImageIndex].id}`}
                                width={800}
                                height={600}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                    </Box>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 16,
                                left: "50%",
                                transform: "translateX(-50%)",
                                color: "white",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                zIndex: 1,
                            }}
                        >
                            <Typography variant="body2">
                                {currentImageIndex + 1} / {images.length}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
} 