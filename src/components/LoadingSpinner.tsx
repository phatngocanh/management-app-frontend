import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingSpinnerProps {
    message?: string;
    size?: number;
    fullHeight?: boolean;
}

export default function LoadingSpinner({ 
    message = "Đang tải...", 
    size = 40, 
    fullHeight = false 
}: LoadingSpinnerProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                ...(fullHeight && {
                    minHeight: "50vh",
                }),
            }}
        >
            <CircularProgress size={size} />
            {message && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 2, textAlign: "center" }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
} 