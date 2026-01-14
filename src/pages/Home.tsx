import DeckPlayer from '../components/DeckPlayer';

export default function Home() {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="pt-8 px-6 pb-4">
                <h1 className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500">
                    Discover
                </h1>
            </div>

            <div className="flex-1 flex items-center justify-center -mt-4">
                <DeckPlayer />
            </div>
        </div>
    );
}
