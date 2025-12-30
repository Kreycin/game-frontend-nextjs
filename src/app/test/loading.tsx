export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-t-[#d4af37] border-white/20 rounded-full animate-spin"></div>
                <h2 className="text-xl font-bold font-serif tracking-widest text-[#d4af37]">LOADING ARCHIVES...</h2>
            </div>
        </div>
    );
}
