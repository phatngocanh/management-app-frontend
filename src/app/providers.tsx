"use client";

import { LoadingProvider } from "@/components/LoadingContext";
import { theme } from "@/lib/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LoadingProvider>
                    {children}
                </LoadingProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}
