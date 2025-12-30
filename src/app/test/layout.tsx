import './theme.css';

export default function MockupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="mockup-body">
            {children}
        </section>
    )
}
