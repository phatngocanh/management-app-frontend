import { createTheme } from "@mui/material/styles";

// Blue and white theme configuration
export const theme = createTheme({
    palette: {
        mode: "light", // Enforce light mode
        primary: {
            main: "#1976d2", // Material UI blue
            light: "#42a5f5",
            dark: "#1565c0",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#2196f3", // Lighter blue
            light: "#64b5f6",
            dark: "#1976d2",
            contrastText: "#ffffff",
        },
        background: {
            default: "#ffffff",
            paper: "#f8f9fa",
        },
        text: {
            primary: "#1a1a1a",
            secondary: "#666666",
        },
        error: {
            main: "#d32f2f",
        },
        warning: {
            main: "#ed6c02",
        },
        info: {
            main: "#0288d1",
        },
        success: {
            main: "#2e7d32",
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: "2.5rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        h3: {
            fontSize: "1.75rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        h4: {
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        h5: {
            fontSize: "1.25rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        h6: {
            fontSize: "1rem",
            fontWeight: 500,
            color: "#1976d2",
        },
        body1: {
            fontSize: "1rem",
            lineHeight: 1.5,
        },
        body2: {
            fontSize: "0.875rem",
            lineHeight: 1.43,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
                    "&:hover": {
                        boxShadow: "0 4px 8px rgba(25, 118, 210, 0.3)",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#1976d2",
                    boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
                },
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
});

export default theme;
