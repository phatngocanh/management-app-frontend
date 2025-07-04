import "./globals.css";

import Providers from "./providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <title>Order App</title>
                <meta name="title" content="Order App" />
                <meta name="description" content="Order management application" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>

            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
