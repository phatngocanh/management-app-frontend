import { ReactNode } from "react";

import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface LoadingButtonProps extends Omit<ButtonProps, 'startIcon'> {
    loading?: boolean;
    loadingText?: string;
    startIcon?: ReactNode;
}

export default function LoadingButton({
    loading = false,
    loadingText,
    children,
    disabled,
    startIcon,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            {...props}
            disabled={disabled || loading}
            startIcon={
                loading ? (
                    <CircularProgress size={16} color="inherit" />
                ) : (
                    startIcon
                )
            }
        >
            {loading && loadingText ? loadingText : children}
        </Button>
    );
} 