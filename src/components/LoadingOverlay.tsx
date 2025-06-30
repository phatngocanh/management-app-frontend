import { Backdrop, CircularProgress, Typography } from "@mui/material";

interface LoadingOverlayProps {
    open: boolean;
    message?: string;
}

export default function LoadingOverlay({ open, message = "Đang tải..." }: LoadingOverlayProps) {
    return (
        <Backdrop
            sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
                flexDirection: "column",
                gap: 2,
            }}
            open={open}
        >
            <CircularProgress color="inherit" size={60} />
            {message && (
                <Typography variant="h6" component="div">
                    {message}
                </Typography>
            )}
        </Backdrop>
    );
} 