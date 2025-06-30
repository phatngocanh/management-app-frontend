"use client";

import { useEffect } from "react";

import { auth } from "@/lib/auth";

export default function HomePage() {
    useEffect(() => {
        // Redirect to login if not authenticated, otherwise to dashboard
        if (auth.isAuthenticated()) {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/login";
        }
    }, []);

    return null; // This page will redirect immediately
}
