import Link from "next/link";

type NavItem = {
    href: string;
    label: string;
};

const navItems: NavItem[] = [
    { href: "/new", label: "New Campaign" },
    { href: "/", label: "Campaigns" },
    { href: "/memory", label: "Memory" },
];

export default function AppShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--background)",
                color: "var(--foreground)",
            }}
        >
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                        background: "rgba(11,15,23,0.72)",
                    backdropFilter: "blur(10px)",
                        borderBottom: "1px solid var(--border)",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <Link
                            href="/"
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div style={{ fontWeight: 900, fontSize: 16 }}>
                                SacredStatics
                            </div>
                        </Link>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                            Fundraiser static ads
                        </div>
                    </div>

                    <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    fontSize: 13,
                                    opacity: 0.9,
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    border: "1px solid transparent",
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
                {children}
            </div>
        </div>
    );
}

