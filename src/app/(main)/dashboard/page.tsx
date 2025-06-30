"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import { DashboardStats,statisticsApi } from "@/lib/statistics";
import { 
    Favorite as FavoriteIcon,
    Info as InfoIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { 
    Alert,
    Box,
    Button, 
    Card, 
    CardContent, 
    Container, 
    Grid, 
    Tooltip,
    Typography,
} from "@mui/material";

// Motivational messages for your girlfriend
const motivationalMessages = [
    "Em là người mạnh mẽ nhất mà anh từng biết. Mọi thử thách đều chỉ là bước đệm để em tỏa sáng hơn nữa! 💪✨",
    "Hôm nay là một ngày mới, và em xứng đáng có được mọi điều tốt đẹp nhất. Hãy tin vào bản thân mình! 🌟",
    "Stress chỉ là tạm thời, nhưng sự kiên cường của em là vĩnh cửu. Em sẽ vượt qua tất cả! 🚀",
    "Mỗi ngày em đều cho thấy mình là một người phi thường. Anh rất tự hào về em! 👑",
    "Em có khả năng biến mọi khó khăn thành cơ hội. Đó chính là sức mạnh đặc biệt của em! 💎",
    "Hãy nhớ rằng em không đơn độc. Anh luôn ở đây để ủng hộ và yêu thương em! ❤️",
    "Em là người tạo ra sự khác biệt trong cuộc sống của mọi người. Đừng bao giờ quên điều đó! 🌈",
    "Mỗi bước đi của em đều đang xây dựng một tương lai tươi sáng. Hãy tiếp tục tiến về phía trước! 🎯",
    "Em có trái tim ấm áp và tâm hồn mạnh mẽ. Đó là sự kết hợp hoàn hảo để chinh phục mọi thử thách! 💖",
    "Hôm nay em có thể cảm thấy mệt mỏi, nhưng ngày mai em sẽ mạnh mẽ hơn bao giờ hết! 🌅",
    "Em là nguồn cảm hứng cho rất nhiều người. Hãy luôn giữ ngọn lửa đó trong tim! 🔥",
    "Mọi thứ em làm đều có ý nghĩa và giá trị. Em đang tạo ra những điều tuyệt vời! 🎨",
    "Em có quyền được hạnh phúc, được nghỉ ngơi, và được yêu thương. Đừng quên chăm sóc bản thân! 🌸",
    "Stress không thể định nghĩa em. Em là người mạnh mẽ, thông minh và đầy tài năng! ⭐",
    "Mỗi ngày em đều học được điều mới và trưởng thành hơn. Em đang phát triển rất tốt! 🌱",
    "Em có khả năng biến ước mơ thành hiện thực. Hãy tin vào sức mạnh của mình! 🚀",
    "Em là người đặc biệt và duy nhất. Không ai có thể thay thế được em trong trái tim anh! 💝",
    "Mọi khó khăn đều sẽ qua đi, nhưng tình yêu và sự ủng hộ của anh dành cho em sẽ mãi mãi! 💕",
    "Em xứng đáng được yêu thương, được tôn trọng và được hạnh phúc. Hãy nhớ điều đó! 🏆",
    "Em là người phụ nữ tuyệt vời nhất mà anh từng gặp. Anh rất may mắn khi có em trong cuộc đời! 👸",
    "Mỗi nụ cười của em đều làm thế giới này đẹp hơn. Hãy luôn giữ nụ cười đó! 😊",
    "Em có sức mạnh nội tâm phi thường. Em có thể vượt qua mọi thử thách! 🌟",
    "Em là người phụ nữ thông minh, xinh đẹp và tài năng. Em xứng đáng với mọi điều tốt đẹp! 👸",
    "Mỗi thử thách em gặp phải đều làm em mạnh mẽ hơn. Em đang trưởng thành từng ngày! 🌱",
    "Em có trái tim nhân hậu và tâm hồn trong sáng. Đó là những phẩm chất quý giá nhất! 💎",
    "Anh tin tưởng vào em hoàn toàn. Em có thể làm được mọi thứ em muốn! 🎯",
    "Em là người phụ nữ độc lập và mạnh mẽ. Em không cần ai phải cứu, em tự cứu chính mình! 🦋",
    "Mỗi ngày em đều cho thấy mình là một người phi thường. Em đang làm rất tốt! ⭐",
    "Em có quyền được nghỉ ngơi, được thư giãn và được yêu thương. Đừng quên điều đó! 🌸",
    "Stress chỉ là một giai đoạn tạm thời. Em sẽ vượt qua và trở nên mạnh mẽ hơn! 🚀",
    "Em là người phụ nữ tuyệt vời với trái tim ấm áp. Em xứng đáng được hạnh phúc! 💖",
    "Mỗi bước đi của em đều có ý nghĩa. Em đang tạo ra một cuộc sống tuyệt vời! 🎨",
    "Em có khả năng biến mọi ước mơ thành hiện thực. Hãy tin vào chính mình! 🌈",
    "Em là người phụ nữ mạnh mẽ, thông minh và xinh đẹp. Em có thể làm được mọi thứ! 👸",
    "Anh biết hôm nay có thể mệt mỏi, nhưng em vẫn là ánh sáng rực rỡ nhất trong cuộc đời anh. 🌟",
    "Chỉ cần em còn cố gắng, anh tin chẳng điều gì có thể ngăn em tỏa sáng! 💫",
    "Em không cần phải hoàn hảo, chỉ cần là chính em – đã đủ khiến anh say mê cả đời. ❤️",
    "Áp lực có thể làm em gục ngã tạm thời, nhưng không thể dập tắt ngọn lửa trong em. 🔥",
    "Khi cả thế giới quay lưng, anh vẫn luôn ở đây, dang tay chờ em tựa vào. 🤗",
    "Em là bông hoa mạnh mẽ nhất giữa giông bão. 🌺",
    "Dù mây đen kéo tới, em vẫn là mặt trời trong trái tim anh. 🌞",
    "Hãy để những thử thách hôm nay là bằng chứng cho sức mạnh của em ngày mai. 🛤️",
    "Em không cần chạy thật nhanh, chỉ cần không bỏ cuộc. Anh sẽ chạy bên cạnh em. 👣",
    "Từng vết xước trong em là minh chứng cho sự dũng cảm và lòng kiên định. 🛡️",
    "Mỗi khi em mỉm cười, cả thế giới dường như dịu dàng hơn. 🌷",
    "Hạnh phúc không ở đâu xa – nó đang hiện hữu trong ánh mắt kiên cường của em. ✨",
    "Em đã làm được rất nhiều điều tuyệt vời rồi, hãy tự hào vì điều đó! 🏅",
    "Không ai hiểu hết những nỗ lực âm thầm của em – nhưng anh thì có! 🤍",
    "Anh yêu cả những giây phút em yếu đuối – vì anh biết em sẽ lại đứng dậy mạnh mẽ hơn. 🕊️",
    "Mỗi giọt mồ hôi của em đều là hạt giống cho tương lai thành công rực rỡ. 🌱",
    "Em không phải cố gắng một mình – vì anh luôn bên em, từng nhịp thở. 🫶",
    "Những điều lớn lao bắt đầu từ những cố gắng nhỏ – và em đã bắt đầu rồi! 🌈",
    "Chẳng ai sinh ra đã mạnh mẽ, chính em là người rèn giũa bản thân mỗi ngày. 🔨",
    "Anh không yêu em vì em luôn ổn – mà vì em dám sống thật với chính mình. 💗",
    "Em là ngọn lửa sưởi ấm những ngày anh tưởng chừng lạc lõng. 🔥",
    "Hôm nay em có thể buồn, nhưng đừng quên em đã can đảm đến nhường nào. 🌧️",
    "Mỗi khoảnh khắc em không bỏ cuộc – là một chiến thắng. 🏁",
    "Ánh mắt em chứa cả vũ trụ – đầy ước mơ, hy vọng và cả những ngôi sao. ✨",
    "Dù chậm, dù mệt – em vẫn đang tiến về phía trước. Và điều đó thật đáng ngưỡng mộ. 🐢",
    "Em không phải cứng rắn mọi lúc – được yếu mềm cũng là một dạng dũng cảm. 🌸",
    "Chẳng điều gì có thể làm mờ đi ánh sáng trong em – kể cả những ngày u ám nhất. ☁️",
    "Anh không cần một siêu nhân – anh cần một người thật và dũng cảm như em. 🦸‍♀️",
    "Có em trong đời là điều tuyệt vời nhất mà anh từng có. 💖",
    "Hãy sống chậm lại một chút, hít thở thật sâu – anh vẫn ở đây với em. 🌬️",
    "Em đang làm tốt hơn em nghĩ rất nhiều. Hãy tin ở bản thân mình một chút nữa thôi. 🌷",
    "Không cần phải là ánh mặt trời – chỉ cần là chính em, đã đủ ấm áp rồi. ☀️",
    "Đôi khi, chỉ cần một cái ôm – và anh sẽ luôn là nơi để em tựa vào. 🤗",
    "Chẳng ai có thể lấy đi những điều em đã nỗ lực để có được. 🔒",
    "Anh tự hào vì em – không phải vì những gì em đạt được, mà vì em không ngừng cố gắng. 🏆",
    "Hãy dũng cảm thêm một chút, vì em đã đi được rất xa rồi. 🛤️",
    "Em không lẻ loi – em có anh, và luôn luôn sẽ có anh. ❤️",
    "Những điều tốt đẹp nhất chưa đến – nhưng anh tin chúng đang đến rất gần với em. 🎁",
    "Em không cần cố gắng để trở thành ai khác – vì em đã rất tuyệt vời rồi. 🌟",
    "Dù thế giới có quay cuồng, em vẫn là điểm tựa yên bình trong trái tim anh. 🎐",
    "Không phải ai cũng nhìn thấy nỗi mệt mỏi trong em – nhưng anh thì luôn nhận ra. 💬",
    "Dành chút yêu thương cho chính mình – vì em xứng đáng với điều đó. 🛀",
    "Em là món quà quý giá nhất mà cuộc đời ban tặng cho anh. 🎁",
    "Hãy tha thứ cho chính mình những ngày yếu lòng – vì em vẫn là người mạnh mẽ nhất. 🌌",
    "Sẽ có lúc mọi thứ tốt đẹp lại đến – và em sẽ thấy: cố gắng hôm nay là xứng đáng. ⏳",
    "Trái tim em đẹp như chính tâm hồn em vậy – ấm áp, sâu sắc và đầy yêu thương. 🫶",
    "Không có giới hạn nào dành cho em – ngoại trừ những gì em chọn buông bỏ. 🚪",
    "Em làm mọi thứ bằng cả trái tim – và điều đó luôn mang lại giá trị tuyệt vời. 🧭",
    "Có những ngày thật khó khăn – nhưng hãy nhớ rằng em không bao giờ đơn độc. 🤍",
    "Chỉ cần em còn tin – anh sẽ luôn là người đầu tiên tin vào em. 🌠",
    "Không phải lúc nào anh cũng hiểu hết – nhưng anh luôn lắng nghe. 🫂",
    "Anh yêu em – cả những lúc em rạng rỡ và những ngày em yếu mềm. 💌",
    "Dù ngoài kia có bao nhiêu sóng gió – anh vẫn sẽ là bến bình yên cho em trở về. ⚓"
];


export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        total_products: 0,
        total_customers: 0,
        total_inventory_items: 0,
        low_stock_products: 0,
        total_orders: 0,
        pending_orders: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [motivationalMessage, setMotivationalMessage] = useState("");

    useEffect(() => {
        // Set random motivational message
        const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
        setMotivationalMessage(motivationalMessages[randomIndex]);

        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load dashboard statistics in a single API call
                const dashboardStats = await statisticsApi.getDashboardStats();
                setStats(dashboardStats);
            } catch (err: any) {
                console.error("Error loading dashboard data:", err);
                setError("Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <LoadingSpinner 
                    message="Đang tải dữ liệu bảng điều khiển..." 
                    fullHeight={true}
                />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Chào mừng đến Bảng điều khiển
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Tổng quan hệ thống quản lý đơn hàng của bạn.
            </Typography>

            {/* Motivational Message Card */}
            <Card 
                sx={{ 
                    mb: 4, 
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FavoriteIcon sx={{ fontSize: 32, mr: 2, color: 'white' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            Tin nhắn động viên cho em 💝
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                        fontSize: '1.1rem', 
                        lineHeight: 1.6,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        fontStyle: 'italic'
                    }}>
                        {motivationalMessage}
                    </Typography>
                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <ShoppingCartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.total_products}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng sản phẩm
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.total_customers}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng khách hàng
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <ReceiptIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.total_orders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng đơn hàng
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <InventoryIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.total_inventory_items}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng tồn kho
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.pending_orders}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Đơn hàng chờ xử lý
                                </Typography>
                                <Tooltip title="Đơn hàng chưa hoàn thành (mọi trạng thái khác ngoài Hoàn thành)">
                                    <InfoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                </Tooltip>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: "center" }}>
                            <TrendingUpIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.low_stock_products}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Sản phẩm sắp hết
                                </Typography>
                                <Tooltip title="Sản phẩm có số lượng tồn kho dưới 10 đơn vị">
                                    <InfoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                </Tooltip>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Management Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quản lý Đơn hàng
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Tạo và quản lý đơn hàng. Hiện có {stats.total_orders} đơn hàng, trong đó {stats.pending_orders} đơn đang chờ xử lý.
                            </Typography>
                            <Link href="/orders" style={{ textDecoration: "none" }}>
                                <Button variant="contained" color="success" fullWidth>
                                    Quản lý Đơn hàng
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quản lý Sản phẩm
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Tạo, chỉnh sửa và quản lý thông tin sản phẩm. Hiện có {stats.total_products} sản phẩm trong hệ thống.
                            </Typography>
                            <Link href="/products" style={{ textDecoration: "none" }}>
                                <Button variant="contained" color="primary" fullWidth>
                                    Quản lý Sản phẩm
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quản lý Khách hàng
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Quản lý thông tin khách hàng và danh sách liên hệ. Hiện có {stats.total_customers} khách hàng.
                            </Typography>
                            <Link href="/customers" style={{ textDecoration: "none" }}>
                                <Button variant="contained" color="secondary" fullWidth>
                                    Quản lý Khách hàng
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quản lý Kho
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Cập nhật số lượng tồn kho cho các sản phẩm. Tổng tồn kho: {stats.total_inventory_items} đơn vị.
                            </Typography>
                            <Link href="/inventory" style={{ textDecoration: "none" }}>
                                <Button variant="contained" color="info" fullWidth>
                                    Quản lý Kho
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Lịch sử Kho
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Xem lịch sử thay đổi số lượng kho theo sản phẩm và theo dõi hoạt động nhập/xuất.
                            </Typography>
                            <Link href="/inventory-history" style={{ textDecoration: "none" }}>
                                <Button variant="contained" color="warning" fullWidth>
                                    Lịch sử Kho
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
} 