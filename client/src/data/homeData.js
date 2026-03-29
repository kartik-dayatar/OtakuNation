// ── Hero Carousel Slides ──
export const heroSlides = [
    {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#2563eb 100%)',
        badge: 'New Season Drop',
        title: 'Where Every Otaku Belongs',
        subtitle: 'Premium figures, apparel & collectibles from 300+ anime series. Officially licensed, globally shipped.',
        primaryBtn: { text: 'Shop Now', link: '/products' },
        secondaryBtn: { text: 'New Arrivals', link: '/products?type=new' },
        visuals: [
            { img: '/src/assets/images/hero/demon_slayer_float.png', text: 'Demon Slayer', class: 'float-1' },
            { img: '/src/assets/images/hero/jjk_float.png', text: 'Jujutsu Kaisen', class: 'float-2' },
            { img: '/src/assets/images/hero/one_piece_float.png', text: 'One Piece', class: 'float-3' }
        ]
    },
    {
        bg: 'linear-gradient(135deg,#1a0a2e 0%,#3b1d6e 50%,#7c3aed 100%)',
        badge: 'Limited Edition',
        title: 'Exclusive Figure Collection',
        subtitle: 'Hand-painted, limited-run figures from top studios. Each piece is a masterpiece for your collection.',
        primaryBtn: { text: 'View Figures', link: '/products?category=figures' },
        secondaryBtn: { text: 'Collectibles', link: '/products?category=collectibles' },
        visuals: [
            { img: '/src/assets/images/hero/aot_float.png', text: 'Attack on Titan', class: 'float-1' },
            { img: '/src/assets/images/hero/spy_family_float.png', text: 'Spy x Family', class: 'float-2' },
            { img: '/src/assets/images/hero/mha_float.png', text: 'My Hero Academia', class: 'float-3' }
        ]
    },
    {
        bg: 'linear-gradient(135deg,#0c1220 0%,#1e293b 50%,#334155 100%)',
        badge: 'Summer Sale',
        title: 'Up to 40% Off Everything',
        subtitle: 'Biggest anime merch sale of the year. Grab your favorites before they\'re gone!',
        primaryBtn: { text: 'Shop Sale', link: '/products' },
        secondaryBtn: { text: 'Gift Cards', link: '/giftcards' },
        visuals: [
            { img: '/src/assets/images/hero/naruto_float.png', text: 'Naruto', class: 'float-1' },
            { img: '/src/assets/images/hero/dbz_float.png', text: 'Dragon Ball Z', class: 'float-2' },
            { img: '/src/assets/images/hero/csm_float.png', text: 'Chainsaw Man', class: 'float-3' }
        ]
    }
];

export const statsData = [
    { icon: 'package', strong: '3,000+', text: 'Products' },
    { icon: 'film', strong: '300+', text: 'Anime Series' },
    { icon: 'happy', strong: '10k+', text: 'Happy Customers' },
    { icon: 'lock', strong: '100%', text: 'Secure Checkout' },
    { icon: 'check', strong: 'Authentic', text: 'Licensed Merch' }
];

// ── Shop by Anime (thumbnail images) ──
export const animeList = [
    { name: 'Demon Slayer', count: '240+ items', img: '/src/assets/images/thumbnails/chainsawman.jpg', link: 'demon-slayer' },
    { name: 'Jujutsu Kaisen', count: '180+ items', img: '/src/assets/images/thumbnails/JJK.jpg', link: 'jujutsu-kaisen' },
    { name: 'One Piece', count: '320+ items', img: '/src/assets/images/thumbnails/one_piece.jpg', link: 'one-piece' },
    { name: 'Naruto', count: '280+ items', img: '/src/assets/images/thumbnails/naruto.jpg', link: 'naruto' },
    { name: 'Attack on Titan', count: '150+ items', img: '/src/assets/images/thumbnails/AOT.jpg', link: 'attack-on-titan' },
    { name: 'Spy x Family', count: '120+ items', img: '/src/assets/images/thumbnails/spy_family_float.png', link: 'spy-x-family' },
    { name: 'Dragon Ball Z', count: '260+ items', img: '/src/assets/images/thumbnails/DBZ.jpg', link: 'dragon-ball' },
    { name: 'My Hero Academia', count: '200+ items', img: '/src/assets/images/thumbnails/MHA.jpg', link: 'my-hero-academia' },
    { name: 'Chainsaw Man', count: '90+ items', img: '/src/assets/images/thumbnails/chainsawman.jpg', link: 'chainsaw-man' }
];

// ── Trending Products (product images) ──
export const trendingProducts = [
    { id: 1, name: 'Demon Slayer Haori', anime: 'Demon Slayer', price: '₹3,735', rating: '4.9', img: '/src/assets/images/products/Haori.jpg', badge: 'Trending' },
    { id: 2, name: 'Gojo Satoru Figure', anime: 'Jujutsu Kaisen', price: '₹7,387', rating: '4.8', img: '/src/assets/images/products/gojo-figure.jpg', badge: 'Trending' },
    { id: 3, name: 'Luffy Straw Hat', anime: 'One Piece', price: '₹2,407', rating: '4.9', img: '/src/assets/images/products/luffy-hat.jpg', badge: 'Hot' },
    { id: 4, name: 'Naruto Headband', anime: 'Naruto Shippuden', price: '₹1,577', rating: '4.7', img: '/src/assets/images/products/naruto-headband.jpg', badge: 'New' },
    { id: 5, name: 'Deku Hero Jacket', anime: 'My Hero Academia', price: '₹5,395', rating: '4.6', img: '/src/assets/images/products/deku-jackate.jpg', badge: 'Trending' },
    { id: 6, name: 'Anya Forger Plush', anime: 'Spy x Family', price: '₹2,656', rating: '4.9', img: '/src/assets/images/products/anya-plush.jpg', badge: 'Limited' },
    { id: 7, name: 'Levi Ackerman Poster', anime: 'Attack on Titan', price: '₹1,245', rating: '4.8', img: '/src/assets/images/products/levi-poster.jpg', badge: 'Sale' },
    { id: 8, name: 'Vegeta Figure', anime: 'Dragon Ball Z', price: '₹3,486', rating: '4.7', img: '/src/assets/images/products/vagita-figure.jpg', badge: 'Popular' }
];

// ── Fresh Drops (product images) ──
export const freshDrops = [
    { name: 'Gojo Satoru Poster', price: '₹15,687', img: '/src/assets/images/products/gojo-poster.jpg' },
    { name: 'Hashira Statue', price: '₹10,707', img: '/src/assets/images/products/hashira-statchu.jpg' },
    { name: 'Anya Waku Waku Edition', price: '₹6,142', img: '/src/assets/images/products/anya.jpg' }
];

export const whyUsData = [
    { icon: 'quality', title: 'Premium Quality', text: 'Every item is sourced from authorized manufacturers. No bootlegs, ever.' },
    { icon: 'truck', title: 'Fast Delivery', text: 'Express shipping worldwide. Most orders ship within 24 hours of purchase.' },
    { icon: 'shield', title: 'Secure Payments', text: '256-bit SSL encryption. We support cards, UPI, wallets, and crypto.' },
    { icon: 'crown', title: 'Authentic Licensed', text: 'Officially licensed merchandise from Bandai, Good Smile, Funko & more.' }
];

export const reviewsData = [
    { text: '"The Demon Slayer haori I ordered is absolutely stunning. The quality exceeded my expectations. Shipping was fast too!"', author: 'Sakura M.', initial: 'S', bg: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
    { text: '"Best anime merch store I\'ve found. The Gojo figure is incredibly detailed. Already planning my next order!"', author: 'Riku T.', initial: 'R', bg: 'linear-gradient(135deg,#ef4444,#f97316)' },
    { text: '"Ordered the One Piece collector\'s box. Packaging was premium, items were perfect. This is THE store for anime fans."', author: 'Aiden K.', initial: 'A', bg: 'linear-gradient(135deg,#22c55e,#14b8a6)' }
];

// ── News Cards (editorial images) ──
export const newsData = [
    { tag: 'Announcement', title: 'Jujutsu Kaisen Season 3 Confirmed for Fall 2026', text: 'MAPPA Studios confirms the return of Yuji Itadori in the highly anticipated Culling Game arc.', img: '/src/assets/images/editorial/news_jjk_season3.png' },
    { tag: 'Release', title: 'One Piece Film: Grand Line Breaks Box Office Records', text: 'The latest One Piece movie surpasses $500M globally, becoming the highest-grossing anime film.', img: '/src/assets/images/editorial/news_onepiece_film.png' },
    { tag: 'Collab', title: 'Bandai x OtakuNation Exclusive Figure Drop', text: 'Limited-edition collaboration figures available only at OtakuNation. Pre-orders open this weekend!', img: '/src/assets/images/editorial/news_figure_drop.png' },
    { tag: 'Trending', title: 'Dragon Ball Daima: New Series Reveals Main Cast', text: 'The new Dragon Ball series introduces fresh characters alongside Goku and Vegeta.', img: '/src/assets/images/editorial/news_dragonball_daima.png' }
];

// ── Blog Cards (editorial images) ──
export const blogData = [
    { date: 'Feb 10, 2026', title: 'Top 10 Anime Trends to Watch in 2026', text: 'From isekai evolution to AI-generated manga, here\'s what\'s shaping the anime industry this year.', img: '/src/assets/images/editorial/blog_anime_trends.png' },
    { date: 'Feb 5, 2026', title: 'Figure Spotlight: Gojo Satoru Unlimited Void', text: 'An in-depth look at the most sought-after JJK figure of the year.', img: '/src/assets/images/editorial/blog_gojo_figure.png' },
    { date: 'Jan 28, 2026', title: 'Upcoming Releases: Spring 2026 Anime Merch', text: 'Preview the hottest merchandise drops coming this spring.', img: '/src/assets/images/editorial/blog_spring_merch.png' }
];
