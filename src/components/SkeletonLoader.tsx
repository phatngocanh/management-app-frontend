import { 
    Box, 
    Card, 
    CardContent, 
    Skeleton, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow 
} from "@mui/material";

interface SkeletonLoaderProps {
    type: "table" | "card" | "list";
    rows?: number;
    columns?: number;
}

export default function SkeletonLoader({ 
    type, 
    rows = 5, 
    columns = 4 
}: SkeletonLoaderProps) {
    if (type === "table") {
        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, index) => (
                                <TableCell key={index}>
                                    <Skeleton animation="wave" width="60%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <Skeleton animation="wave" width="80%" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    if (type === "card") {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Array.from({ length: rows }).map((_, index) => (
                    <Card key={index}>
                        <CardContent>
                            <Skeleton animation="wave" height={40} width="60%" sx={{ mb: 1 }} />
                            <Skeleton animation="wave" height={20} width="40%" />
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    if (type === "list") {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({ length: rows }).map((_, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Skeleton animation="wave" variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton animation="wave" height={20} width="60%" />
                            <Skeleton animation="wave" height={16} width="40%" />
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    }

    return null;
} 